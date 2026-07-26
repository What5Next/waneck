"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleUser,
  Heart,
  LogOut,
  NotebookText,
  Pencil,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { PageLoading } from "@/components/ui/page-loading";
import { PageNavBar } from "@/components/ui/page-nav-bar";
import { List } from "@/components/ui/list";
import { Row, RowLink } from "@/components/ui/row";
import { NexBalanceBar } from "@/components/nex/nex-balance-bar";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { Switch } from "@/components/ui/switch";
import { PersonaSettings } from "@/components/persona/persona-settings";
import { UserNotesSettings } from "@/components/user-notes/user-notes-settings";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { SiteFooter } from "@/components/layout/site-footer";
import { settingsIntroDescriptionClassName } from "@/components/default-settings/settings-field-classes";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import { useLikedCharactersQuery } from "@/hooks/queries/use-liked-characters-query";
import { useMyCharactersQuery } from "@/hooks/queries/use-my-characters-query";
import { useSignOut } from "@/hooks/mutations/use-sign-out";
import { useSafetyFilter } from "@/hooks/use-user-settings";
import { getDefaultPersona } from "@/lib/api/user-settings";

type DefaultSettingModal = "persona" | "notes";

const DEFAULT_SETTING_TITLES: Record<DefaultSettingModal, string> = {
  persona: "Persona",
  notes: "User notes",
};

const DEFAULT_SETTING_DESCRIPTIONS: Record<DefaultSettingModal, string> = {
  persona: "Chat with the character based on your persona.",
  notes: "Write what you'd like applied whenever you start a new story.",
};

export function MyPageView() {
  const router = useRouter();
  const signOutMutation = useSignOut();
  const { data: profile, isPending: loading } = useProfileQuery();
  const { data: defaultSettings, isPending: settingsLoading } =
    useDefaultSettingsQuery({ enabled: !!profile });
  const { data: likedCharacters = [] } = useLikedCharactersQuery({
    enabled: !!profile,
  });
  const { data: myCharacters = [] } = useMyCharactersQuery({
    enabled: !!profile,
  });
  const { enabled: safetyFilterEnabled, setEnabled: setSafetyFilterEnabled } =
    useSafetyFilter();
  const [defaultSettingModal, setDefaultSettingModal] =
    useState<DefaultSettingModal | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const defaultPersona = defaultSettings
    ? getDefaultPersona(defaultSettings)
    : null;
  const sessionNote = defaultSettings?.preferences.sessionNote ?? "";
  const settingsSummaryLoading = settingsLoading;

  const personaSummaryLabel = settingsSummaryLoading
    ? "..."
    : (defaultPersona?.name ?? "...");
  const notesSummaryLabel = settingsSummaryLoading
    ? "..."
    : sessionNote.trim()
      ? sessionNote.trim()
      : "No notes yet";

  function handleSafetyFilterChange(enabled: boolean) {
    if (!enabled) {
      toast.error("This feature isn't supported yet.");
      return;
    }
    setSafetyFilterEnabled(enabled);
  }

  async function handleSignOut() {
    await signOutMutation.mutateAsync();
  }

  function handleDefaultSettingOpenChange(open: boolean) {
    if (!open) setDefaultSettingModal(null);
  }

  if (loading || !profile) {
    return <PageLoading />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="sticky top-0 z-20 hidden shrink-0 bg-background/95 backdrop-blur-sm sm:block">
        <div className="mx-auto flex h-14 max-w-3xl items-center border-b border-border px-2">
          <IconButton
            onClick={() => router.back()}
            className="hover:bg-muted/50"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <h1 className="px-1 text-base font-semibold">My Page</h1>
        </div>
      </header>

      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto pb-8">
        <PageNavBar
          title="My Page"
          onBack={() => router.back()}
          titleClassName="font-semibold text-foreground"
          className="sm:hidden"
        />

        <section className="mx-auto max-w-3xl space-y-5 px-4 py-4">
          <button
            type="button"
            onClick={() => setEditProfileOpen(true)}
            className="flex w-full items-center gap-3.5 rounded-2xl bg-muted/30 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
          >
            <Avatar className="h-12 w-12">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {getProfileInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold">
                {profile.display_name}
              </h2>
              <p className="truncate text-sm text-muted-foreground/70">
                {profile.handle}
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          </button>

          <NexBalanceBar href="/nex" balance={profile.token_balance ?? 0} />

          <List title="Default settings" className="mt-6">
            <Row
              icon={<CircleUser className="h-4 w-4" />}
              label="Persona"
              value={personaSummaryLabel}
              onClick={() => setDefaultSettingModal("persona")}
            />
            <Row
              icon={<NotebookText className="h-4 w-4" />}
              label="User notes"
              value={notesSummaryLabel}
              onClick={() => setDefaultSettingModal("notes")}
            />
          </List>

          <List title="MY">
            <RowLink
              href="/mypage/characters"
              icon={<Pencil className="h-4 w-4" />}
              label="My characters"
              value={String(myCharacters.length)}
            />
            <RowLink
              href="/mypage/liked"
              icon={<Heart className="h-4 w-4" />}
              label="Liked characters"
              value={String(likedCharacters.length)}
            />
            <Row
              icon={<Shield className="h-4 w-4" />}
              label="Safety filter"
              interactive={false}
              showChevron={false}
              trailing={
                <Switch
                  checked={safetyFilterEnabled}
                  onCheckedChange={handleSafetyFilterChange}
                  aria-label="Safety filter"
                />
              }
            />
          </List>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "flex w-full items-center justify-start gap-2 rounded-2xl px-3 py-2.5 text-sm",
                "text-white/40 transition-colors hover:bg-muted/30 hover:text-white/70",
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </section>

        <SiteFooter />
      </div>

      <SettingsDialog
        open={defaultSettingModal !== null}
        onOpenChange={handleDefaultSettingOpenChange}
        title={
          defaultSettingModal
            ? DEFAULT_SETTING_TITLES[defaultSettingModal]
            : ""
        }
      >
        {defaultSettingModal ? (
          <p className={cn("mb-5", settingsIntroDescriptionClassName)}>
            {DEFAULT_SETTING_DESCRIPTIONS[defaultSettingModal]}
          </p>
        ) : null}
        {defaultSettingModal === "persona" ? (
          <PersonaSettings hideLabel />
        ) : null}
        {defaultSettingModal === "notes" ? (
          <UserNotesSettings hideLabel />
        ) : null}
      </SettingsDialog>

      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </div>
  );
}
