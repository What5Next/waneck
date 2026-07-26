import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import type { CharacterIntroMessage } from "@/lib/types";
import type { TablesUpdate } from "@/lib/database.types";
import { getCommentCountForCharacter } from "@/lib/api/character-comment-counts";
import {
  getCharacterOr404,
  requireAuthenticatedUser,
} from "@/lib/api/character-stats-auth";
import { normalizeCharacterGenres } from "@/lib/character-genres";
import { deleteS3ObjectByUrl } from "@/lib/s3";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("characters")
    .select(
      `
      *,
      creator:users!characters_created_by_fkey(display_name),
      intro_messages:character_intro_messages(role, content, created_at, sort_order)
    `,
    )
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "character_intro_messages",
      ascending: true,
    })
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Character not found" },
      { status: 404 },
    );
  }

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  let isLiked = false;

  if (user) {
    const { data: likeRow } = await supabaseAdmin
      .from("character_likes")
      .select("id")
      .eq("character_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    isLiked = !!likeRow;
  }

  const actualCommentCount = await getCommentCountForCharacter(id);
  const commentCount =
    actualCommentCount === null
      ? (data.comment_count ?? 0)
      : actualCommentCount;

  return NextResponse.json({
    ...data,
    like_count: data.like_count ?? 0,
    comment_count: commentCount,
    message_count: data.message_count ?? 0,
    creator: data.creator,
    intro_messages: (data.intro_messages ?? []) as CharacterIntroMessage[],
    is_liked: isLiked,
  });
}

type IntroTurn = { role: string; text: string };

type UpdateCharacterBody = {
  name?: string;
  short_intro?: string;
  system_prompt?: string;
  tag?: string;
  genres?: string[];
  mood?: string;
  description?: string;
  suggestions?: string[];
  introTurns?: IntroTurn[];
  profile_image_url?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const auth = await requireAuthenticatedUser();
  if (auth.errorResponse) return auth.errorResponse;

  const { character, errorResponse } = await getCharacterOr404(id);
  if (errorResponse) return errorResponse;

  if (character.created_by !== auth.user.id) {
    return NextResponse.json(
      { error: "본인이 만든 캐릭터만 수정할 수 있습니다" },
      { status: 403 },
    );
  }

  const body: UpdateCharacterBody = await req.json();

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "이름은 필수입니다" }, { status: 400 });
  }
  if (body.system_prompt !== undefined && !body.system_prompt.trim()) {
    return NextResponse.json(
      { error: "시스템 프롬프트는 필수입니다" },
      { status: 400 },
    );
  }

  const update: TablesUpdate<"characters"> = {};
  if (body.name !== undefined) update.name = body.name.trim();
  if (body.system_prompt !== undefined)
    update.system_prompt = body.system_prompt.trim();
  if (body.short_intro !== undefined)
    update.short_intro = body.short_intro.trim() || null;
  if (body.tag !== undefined) update.tag = body.tag.trim() || null;
  if (body.mood !== undefined) update.mood = body.mood.trim() || null;
  if (body.description !== undefined)
    update.description = body.description.trim() || null;
  if (body.suggestions !== undefined)
    update.suggestions = body.suggestions.filter(Boolean);
  if (body.genres !== undefined)
    update.genres = normalizeCharacterGenres(body.genres);
  if (body.profile_image_url !== undefined)
    update.profile_image_url = body.profile_image_url;

  const { data, error } = await supabaseAdmin
    .from("characters")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.introTurns !== undefined) {
    const { error: deleteError } = await supabaseAdmin
      .from("character_intro_messages")
      .delete()
      .eq("character_id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: "인트로 메시지 갱신 실패: " + deleteError.message },
        { status: 500 },
      );
    }

    const introTurns = body.introTurns.filter((t) => t.text.trim());
    if (introTurns.length > 0) {
      const { error: introError } = await supabaseAdmin
        .from("character_intro_messages")
        .insert(
          introTurns.map((t, i) => ({
            character_id: id,
            role: t.role,
            content: t.text.trim(),
            sort_order: i,
          })),
        );

      if (introError) {
        return NextResponse.json(
          { error: "인트로 메시지 저장 실패: " + introError.message },
          { status: 500 },
        );
      }
    }
  }

  // 캐릭터 정보 변경이 모두 성공한 뒤에만 기존 S3 이미지 삭제 (실패해도 응답에는 영향 없음)
  const oldImageUrl = character.profile_image_url;
  if (
    body.profile_image_url !== undefined &&
    oldImageUrl &&
    oldImageUrl !== body.profile_image_url
  ) {
    try {
      await deleteS3ObjectByUrl(oldImageUrl);
    } catch (err) {
      console.error("[PATCH /api/characters/:id] old image delete failed:", err);
    }
  }

  return NextResponse.json(data);
}
