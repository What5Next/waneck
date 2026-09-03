import type { User as AuthUser } from "@supabase/supabase-js";

export const PROFILE_DISPLAY_NAME_MAX = 30;

export type ProfileSummary = {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  token_balance: number;
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
