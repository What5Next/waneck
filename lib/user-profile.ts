import type { User as AuthUser } from "@supabase/supabase-js";

export type ProfileTab = "characters" | "followers" | "following";

export type ProfileSummary = {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  wons_received_30d: number;
  public_character_count: number;
  chat_count: number;
  characters: Array<{
    id: string;
    name: string;
    short_intro: string | null;
    profile_image_url: string | null;
    tag: string | null;
    created_at: string;
  }>;
};

export function getProfileHandle(
  user: AuthUser,
  displayName: string | null | undefined,
): string {
  const metadataHandle =
    (user.user_metadata?.user_name as string | undefined) ??
    (user.user_metadata?.preferred_username as string | undefined);

  if (metadataHandle) return `@${metadataHandle.replace(/^@/, "")}`;

  const emailHandle = user.email?.split("@")[0];
  if (emailHandle) return `@${emailHandle}`;

  const slug = displayName?.trim().toLowerCase().replace(/\s+/g, "-");
  return slug ? `@${slug}` : "@user";
}

export function getProfileName(
  user: AuthUser,
  displayName: string | null | undefined,
): string {
  return (
    displayName?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "User"
  );
}

export function getProfileInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
