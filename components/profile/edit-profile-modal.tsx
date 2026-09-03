"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import {
  SettingsFormActions,
  SettingsSaveButton,
} from "@/components/default-settings/settings-save-button";
import { settingsFieldClassName } from "@/components/default-settings/settings-field-classes";
import {
  PROFILE_DISPLAY_NAME_MAX,
  getProfileInitials,
  type ProfileSummary,
} from "@/lib/user-profile";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import { useUpdateProfileMutation } from "@/hooks/mutations/use-update-profile-mutation";

type EditProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  return (
    <SettingsDialog open={open} onOpenChange={onOpenChange} title="Edit profile">
      {open ? (
        <EditProfileForm onSaved={() => onOpenChange(false)} />
      ) : null}
    </SettingsDialog>
  );
}

function EditProfileForm({ onSaved }: { onSaved: () => void }) {
  const { data: profile, isPending, isError } = useProfileQuery();

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-3 pb-1">
        <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-muted/30" />
        <div className="h-11 animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Failed to load profile.
      </p>
    );
  }

  return (
    <EditProfileFormBody
      key={profile.display_name}
      profile={profile}
      onSaved={onSaved}
    />
  );
}

function EditProfileFormBody({
  profile,
  onSaved,
}: {
  profile: ProfileSummary;
  onSaved: () => void;
}) {
  const updateProfileMutation = useUpdateProfileMutation();
  const [draftName, setDraftName] = useState(() => profile.display_name);

  const trimmedName = draftName.trim();
  const isSaveEnabled =
    trimmedName.length > 0 &&
    trimmedName !== profile.display_name &&
    !updateProfileMutation.isPending;

  function handleAvatarClick() {
    toast.error("Photo upload isn't supported yet.");
  }

  function handleSave() {
    if (!isSaveEnabled) return;

    updateProfileMutation.mutate(
      { display_name: trimmedName },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          onSaved();
        },
      },
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5 pb-1">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleAvatarClick}
          className="group relative"
          aria-label="Change profile photo"
        >
          <Avatar className="h-20 w-20">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
              {getProfileInitials(profile.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground ring-2 ring-card transition-colors group-hover:bg-muted/70">
            <Camera className="h-3.5 w-3.5" aria-hidden />
          </span>
        </button>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">Name</p>
        <div className="relative">
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            maxLength={PROFILE_DISPLAY_NAME_MAX}
            placeholder="Your name"
            className={cn(settingsFieldClassName, "pr-14")}
            aria-label="Display name"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {draftName.length}/{PROFILE_DISPLAY_NAME_MAX}
          </span>
        </div>
      </div>

      <SettingsFormActions>
        <SettingsSaveButton enabled={isSaveEnabled} onClick={handleSave} />
      </SettingsFormActions>
    </div>
  );
}
