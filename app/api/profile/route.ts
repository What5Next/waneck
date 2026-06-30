import { NextResponse } from "next/server";

import { enrichCharactersWithStats } from "@/lib/api/character-list-stats";
import {
  getProfileHandle,
  getProfileName,
  type ProfileSummary,
} from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase.server";

export async function GET() {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: profileRow }, { data: characters }, { count: chatCount }] =
      await Promise.all([
        supabaseAdmin
          .from("users")
          .select("display_name, token_balance")
          .eq("id", user.id)
          .maybeSingle(),
        supabaseAdmin
          .from("characters")
          .select(
            "id, name, short_intro, profile_image_url, tag, created_at, message_count, like_count, comment_count",
          )
          .eq("created_by", user.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabaseAdmin
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

    const displayName = getProfileName(user, profileRow?.display_name);
    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ?? null;

    const enrichedCharacters = await enrichCharactersWithStats(characters ?? []);

    const summary: ProfileSummary = {
      id: user.id,
      display_name: displayName,
      handle: getProfileHandle(user, profileRow?.display_name),
      avatar_url: avatarUrl,
      token_balance: profileRow?.token_balance ?? 0,
      follower_count: 0,
      following_count: 0,
      wons_received_30d: 0,
      public_character_count: enrichedCharacters.length,
      chat_count: chatCount ?? 0,
      characters: enrichedCharacters,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[/api/profile GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
