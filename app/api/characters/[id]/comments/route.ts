import { NextRequest, NextResponse } from "next/server";

import {
  COMMENT_SELECT,
  mapCommentRow,
  nestComments,
} from "@/lib/api/character-comment-mapper";
import {
  getCharacterOr404,
  parseCommentContent,
  parseCommentParentId,
  requireAuthenticatedUser,
} from "@/lib/api/character-stats-auth";
import { supabaseAdmin } from "@/lib/supabase.server";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params;
    const { errorResponse } = await getCharacterOr404(characterId);
    if (errorResponse) return errorResponse;

    const limitParam = Number(
      req.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT,
    );
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(1, limitParam), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const { data: topLevelRows, error: topLevelError } = await supabaseAdmin
      .from("character_comments")
      .select(COMMENT_SELECT)
      .eq("character_id", characterId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (topLevelError) {
      console.error("[/api/characters/[id]/comments GET]", topLevelError);
      return NextResponse.json(
        { error: topLevelError.message },
        { status: 500 },
      );
    }

    const topLevel = (topLevelRows ?? []).map(mapCommentRow);
    if (topLevel.length === 0) {
      return NextResponse.json([]);
    }

    const topLevelIds = topLevel.map((comment) => comment.id);
    const { data: replyRows, error: replyError } = await supabaseAdmin
      .from("character_comments")
      .select(COMMENT_SELECT)
      .in("parent_id", topLevelIds)
      .order("created_at", { ascending: true });

    if (replyError) {
      console.error("[/api/characters/[id]/comments GET replies]", replyError);
      return NextResponse.json({ error: replyError.message }, { status: 500 });
    }

    const replies = (replyRows ?? []).map(mapCommentRow);
    return NextResponse.json(nestComments(topLevel, replies));
  } catch (err) {
    console.error("[/api/characters/[id]/comments GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params;
    const auth = await requireAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;

    const { errorResponse } = await getCharacterOr404(characterId);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const parsed = parseCommentContent(body);
    if (parsed instanceof NextResponse) return parsed;

    const parentId = parseCommentParentId(body);
    if (parentId instanceof NextResponse) return parentId;

    if (parentId) {
      const { data: parent, error: parentError } = await supabaseAdmin
        .from("character_comments")
        .select("id, character_id, parent_id")
        .eq("id", parentId)
        .maybeSingle();

      if (parentError) {
        console.error(
          "[/api/characters/[id]/comments POST parent]",
          parentError,
        );
        return NextResponse.json(
          { error: parentError.message },
          { status: 500 },
        );
      }

      if (!parent || parent.character_id !== characterId) {
        return NextResponse.json({ error: "invalid_parent" }, { status: 400 });
      }

      // 1단계 답글만 — parent는 top-level이어야 함
      if (parent.parent_id != null) {
        return NextResponse.json({ error: "invalid_parent" }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from("character_comments")
      .insert({
        character_id: characterId,
        user_id: auth.user.id,
        content: parsed,
        parent_id: parentId,
      })
      .select(COMMENT_SELECT)
      .single();

    if (error || !data) {
      console.error("[/api/characters/[id]/comments POST]", error);
      return NextResponse.json(
        { error: error?.message ?? "Failed to create comment" },
        { status: 500 },
      );
    }

    return NextResponse.json(mapCommentRow(data), { status: 201 });
  } catch (err) {
    console.error("[/api/characters/[id]/comments POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
