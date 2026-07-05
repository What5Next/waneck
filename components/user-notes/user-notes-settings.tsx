"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateUserPreferencesMutation } from "@/hooks/mutations/use-user-preferences-mutation";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import { SESSION_NOTE_MAX } from "@/lib/user-default-settings/constants";
import { settingsSaveButtonClassName, settingsTextareaClassName } from "@/components/default-settings/settings-field-classes";
import { cn } from "@/lib/utils";

type UserNotesSettingsProps = {
  hideLabel?: boolean;
};

export function UserNotesSettings({
  hideLabel = false,
}: UserNotesSettingsProps) {
  const { data: settings, isPending, isError } = useDefaultSettingsQuery();
  const updateMutation = useUpdateUserPreferencesMutation();
  const [draftNote, setDraftNote] = useState("");

  useEffect(() => {
    if (settings) {
      setDraftNote(settings.preferences.sessionNote);
    }
  }, [settings]);

  function handleEditSave() {
    updateMutation.mutate(
      { session_note: draftNote },
      {
        onSuccess: () => {
          toast.success("Note saved.");
        },
      },
    );
  }

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-3 pb-1">
        <div className="h-[120px] animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-[13px] text-muted-foreground">Failed to load notes.</p>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3 pb-1">
      {hideLabel ? null : (
        <p className="text-[11px] text-muted-foreground">Session Note</p>
      )}

      <div className="relative">
        <Textarea
          value={draftNote}
          onChange={(event) => setDraftNote(event.target.value)}
          placeholder="Please provide user note."
          maxLength={SESSION_NOTE_MAX}
          rows={5}
          className={cn(settingsTextareaClassName, "min-h-[120px] pb-6")}
          aria-label="Session note"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {draftNote.length.toLocaleString("en-US")}/
          {SESSION_NOTE_MAX.toLocaleString("en-US")}
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        className={settingsSaveButtonClassName}
        onClick={handleEditSave}
        disabled={updateMutation.isPending}
      >
        Edit Save
      </Button>
    </div>
  );
}
