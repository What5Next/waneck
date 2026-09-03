"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useUpdateConversationSettingsMutation } from "@/hooks/mutations/use-update-conversation-settings-mutation";
import { useUpdateUserPreferencesMutation } from "@/hooks/mutations/use-user-preferences-mutation";
import { useConversationSettingsQuery } from "@/hooks/queries/use-conversation-settings-query";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import type { ConversationSettings } from "@/lib/api/conversation-settings";
import { SESSION_NOTE_MAX } from "@/lib/user-default-settings/constants";
import { SettingsTextareaField } from "@/components/default-settings/settings-textarea-field";
import {
  SettingsFormActions,
  SettingsSaveButton,
} from "@/components/default-settings/settings-save-button";

type UserNotesSettingsProps = {
  hideLabel?: boolean;
  scope?: "global" | "conversation";
  conversationId?: string | null;
};

export function UserNotesSettings({
  hideLabel = false,
  scope = "global",
  conversationId = null,
}: UserNotesSettingsProps) {
  if (scope === "conversation") {
    return (
      <ConversationNotesSettings
        hideLabel={hideLabel}
        conversationId={conversationId}
      />
    );
  }

  return <GlobalNotesSettings hideLabel={hideLabel} />;
}

function ConversationNotesSettings({
  hideLabel = false,
  conversationId,
}: {
  hideLabel?: boolean;
  conversationId?: string | null;
}) {
  const { data: settings, isPending, isError } =
    useConversationSettingsQuery(conversationId);

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-3 pb-1">
        <div className="h-[120px] animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">Failed to load notes.</p>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <ConversationNotesEditor
      key={settings.conversationId}
      hideLabel={hideLabel}
      conversationId={conversationId}
      settings={settings}
    />
  );
}

function ConversationNotesEditor({
  hideLabel,
  conversationId,
  settings,
}: {
  hideLabel: boolean;
  conversationId?: string | null;
  settings: ConversationSettings;
}) {
  const updateMutation = useUpdateConversationSettingsMutation(conversationId);
  const [draftNote, setDraftNote] = useState(() => settings.sessionNote);

  function handleEditSave() {
    updateMutation.mutate(
      { session_note: draftNote },
      {
        onSuccess: () => {
          toast.success("Note saved for this chat.");
        },
      },
    );
  }

  return (
    <NotesEditor
      hideLabel={hideLabel}
      label="This chat note"
      draftNote={draftNote}
      onDraftNoteChange={setDraftNote}
      onSave={handleEditSave}
      isSaving={updateMutation.isPending}
      isDirty={draftNote !== settings.sessionNote}
    />
  );
}

function GlobalNotesSettings({ hideLabel = false }: { hideLabel?: boolean }) {
  const { data: settings, isPending, isError } = useDefaultSettingsQuery();

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-3 pb-1">
        <div className="h-[120px] animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">Failed to load notes.</p>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <GlobalNotesEditor
      key={settings.preferences.updatedAt}
      hideLabel={hideLabel}
      initialNote={settings.preferences.sessionNote}
    />
  );
}

function GlobalNotesEditor({
  hideLabel,
  initialNote,
}: {
  hideLabel: boolean;
  initialNote: string;
}) {
  const updateMutation = useUpdateUserPreferencesMutation();
  const [draftNote, setDraftNote] = useState(() => initialNote);

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

  return (
    <NotesEditor
      hideLabel={hideLabel}
      label="Session Note"
      draftNote={draftNote}
      onDraftNoteChange={setDraftNote}
      onSave={handleEditSave}
      isSaving={updateMutation.isPending}
      isDirty={draftNote !== initialNote}
    />
  );
}

function NotesEditor({
  hideLabel,
  label,
  draftNote,
  onDraftNoteChange,
  onSave,
  isSaving,
  isDirty,
}: {
  hideLabel: boolean;
  label: string;
  draftNote: string;
  onDraftNoteChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col">
      {hideLabel ? null : (
        <p className="mb-3 text-[11px] text-muted-foreground">{label}</p>
      )}

      <SettingsTextareaField
        value={draftNote}
        onChange={onDraftNoteChange}
        maxLength={SESSION_NOTE_MAX}
        placeholder="Please provide user note."
        aria-label="Session note"
      />

      <SettingsFormActions>
        <SettingsSaveButton
          enabled={isDirty && !isSaving}
          onClick={onSave}
        />
      </SettingsFormActions>
    </div>
  );
}
