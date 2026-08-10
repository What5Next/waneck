import { NextResponse } from "next/server";

import {
  PROFILE_DISPLAY_NAME_MAX,
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

    const { data: profileRow } = await supabaseAdmin
      .from("users")
      .select("display_name, token_balance")
      .eq("id", user.id)
      .maybeSingle();

    const summary: ProfileSummary = {
      id: user.id,
      display_name: getProfileName(user, profileRow?.display_name),
      handle: getProfileHandle(user, profileRow?.display_name),
      avatar_url:
        (user.user_metadata?.avatar_url as string | undefined) ?? null,
      token_balance: profileRow?.token_balance ?? 0,
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

export async function PATCH(request: Request) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      display_name?: unknown;
    } | null;

    if (!body || typeof body.display_name !== "string") {
      return NextResponse.json(
        { error: "display_name is required" },
        { status: 400 },
      );
    }

    const trimmedName = body.display_name.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "display_name is required" },
        { status: 400 },
      );
    }
    if (trimmedName.length > PROFILE_DISPLAY_NAME_MAX) {
      return NextResponse.json(
        {
          error: `display_name must be at most ${PROFILE_DISPLAY_NAME_MAX} characters`,
        },
        { status: 400 },
      );
    }

    const { data: profileRow, error: updateError } = await supabaseAdmin
      .from("users")
      .update({ display_name: trimmedName })
      .eq("id", user.id)
      .select("display_name, token_balance")
      .single();

    if (updateError) throw updateError;

    const summary: ProfileSummary = {
      id: user.id,
      display_name: getProfileName(user, profileRow?.display_name),
      handle: getProfileHandle(user, profileRow?.display_name),
      avatar_url:
        (user.user_metadata?.avatar_url as string | undefined) ?? null,
      token_balance: profileRow?.token_balance ?? 0,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[/api/profile PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
