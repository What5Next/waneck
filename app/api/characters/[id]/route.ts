import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase.server";
import type { CharacterIntroMessage } from "@/lib/types";
import { getCommentCountForCharacter } from "@/lib/api/character-comment-counts";

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
