"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteUserPersonaMutation,
  useSetDefaultUserPersonaMutation,
  useUpdateUserPersonaMutation,
} from "@/hooks/mutations/use-user-persona-mutations";
import { useUpdateConversationSettingsMutation } from "@/hooks/mutations/use-update-conversation-settings-mutation";
import { useConversationSettingsQuery } from "@/hooks/queries/use-conversation-settings-query";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import { getDefaultPersona, type UserPersona } from "@/lib/api/user-settings";
import type { ConversationSettings } from "@/lib/api/conversation-settings";
import {
  PERSONA_DESC_MAX,
  PERSONA_NAME_MAX,
} from "@/lib/user-default-settings/constants";
import {
  settingsFieldClassName,
  settingsSaveButtonClassName,
  settingsTextareaClassName,
} from "@/components/default-settings/settings-field-classes";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

export type { UserPersona as Persona };

type PersonaSettingsProps = {
  hideLabel?: boolean;
  scope?: "global" | "conversation";
  conversationId?: string | null;
};

export function PersonaSettings({
  hideLabel = false,
  scope = "global",
  conversationId = null,
}: PersonaSettingsProps) {
  if (scope === "conversation") {
    return (
      <ConversationPersonaSettings
        hideLabel={hideLabel}
        conversationId={conversationId}
      />
    );
  }

  return <GlobalPersonaSettings hideLabel={hideLabel} />;
}

function ConversationPersonaSettings({
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
      <div className="w-full min-w-0 space-y-2.5 pb-1">
        <div className="h-16 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-20 animate-pulse rounded-full bg-muted/30 mx-auto w-20" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Failed to load persona.
      </p>
    );
  }

  return (
    <ConversationPersonaEditor
      key={settings.conversationId}
      hideLabel={hideLabel}
      conversationId={conversationId}
      settings={settings}
    />
  );
}

function ConversationPersonaEditor({
  hideLabel,
  conversationId,
  settings,
}: {
  hideLabel: boolean;
  conversationId?: string | null;
  settings: ConversationSettings;
}) {
  const updateMutation = useUpdateConversationSettingsMutation(conversationId);
  const [draftName, setDraftName] = useState(() => settings.personaName);
  const [draftDescription, setDraftDescription] = useState(
    () => settings.personaDescription,
  );

  function handleSave() {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    updateMutation.mutate(
      {
        persona_name: trimmedName,
        persona_description: draftDescription,
      },
      {
        onSuccess: () => {
          toast.success("Persona saved for this chat.");
        },
      },
    );
  }

  const personaInitials = getProfileInitials(draftName || settings.personaName);

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-1">
      {hideLabel ? null : (
        <p className="text-[11px] text-muted-foreground">This chat persona</p>
      )}

      <div className="relative rounded-xl bg-muted/25 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="h-8 w-8">
            {settings.personaImageUrl ? (
              <AvatarImage src={settings.personaImageUrl} alt={draftName} />
            ) : null}
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {personaInitials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-[13px] font-medium text-foreground">
            {draftName || settings.personaName}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted/25 text-muted-foreground">
          {settings.personaImageUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={settings.personaImageUrl} alt="" />
              <AvatarFallback className="bg-primary/15 text-primary">
                {personaInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </div>
      </div>

      <div className="relative">
        <Input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          maxLength={PERSONA_NAME_MAX}
          className={cn(settingsFieldClassName, "pr-12")}
          aria-label="Persona name"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {draftName.length}/{PERSONA_NAME_MAX}
        </span>
      </div>

      <div className="relative">
        <Textarea
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          placeholder="Enter description..."
          maxLength={PERSONA_DESC_MAX}
          rows={3}
          className={cn(settingsTextareaClassName, "min-h-[88px] pb-6")}
          aria-label="Persona description"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {draftDescription.length.toLocaleString("en-US")}/
          {PERSONA_DESC_MAX.toLocaleString("en-US")}
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        className={settingsSaveButtonClassName}
        onClick={handleSave}
        disabled={updateMutation.isPending}
      >
        Save
      </Button>
    </div>
  );
}

function GlobalPersonaSettings({ hideLabel = false }: { hideLabel?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const { data: settings, isPending, isError } = useDefaultSettingsQuery();
  const updateMutation = useUpdateUserPersonaMutation();
  const setDefaultMutation = useSetDefaultUserPersonaMutation();
  const deleteMutation = useDeleteUserPersonaMutation();

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const personas = useMemo(() => settings?.personas ?? [], [settings?.personas]);

  const defaultPersonaId = settings
    ? (getDefaultPersona(settings)?.id ?? personas[0]?.id ?? null)
    : null;
  const effectivePersonaId = selectedPersonaId ?? defaultPersonaId;

  const activePersona =
    personas.find((persona) => persona.id === effectivePersonaId) ?? personas[0];

  const displayName = isDraftDirty ? draftName : (activePersona?.name ?? "");
  const displayDescription = isDraftDirty
    ? draftDescription
    : (activePersona?.description ?? "");
  const displayImageUrl = localPreviewUrl ?? activePersona?.imageUrl ?? null;

  function clearLocalPreview() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setLocalPreviewUrl(null);
  }

  function resetDraftState() {
    setIsDraftDirty(false);
    setDraftName("");
    setDraftDescription("");
    clearLocalPreview();
  }

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function handleSelectPersona(personaId: string) {
    const selectedPersona = personas.find(
      (persona) => persona.id === personaId,
    );
    if (!selectedPersona) return;

    setSelectedPersonaId(personaId);
    resetDraftState();
    setIsDropdownOpen(false);

    // 드롭다운 선택 = default persona 즉시 전환
    if (!selectedPersona.isDefault) {
      setDefaultMutation.mutate(personaId);
    }
  }

  function handleNameChange(nextName: string) {
    if (!isDraftDirty && activePersona) {
      setDraftName(nextName);
      setDraftDescription(activePersona.description);
      setIsDraftDirty(true);
      return;
    }
    setDraftName(nextName);
  }

  function handleDescriptionChange(nextDescription: string) {
    if (!isDraftDirty && activePersona) {
      setDraftName(activePersona.name);
      setDraftDescription(nextDescription);
      setIsDraftDirty(true);
      return;
    }
    setDraftDescription(nextDescription);
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    clearLocalPreview();

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setLocalPreviewUrl(objectUrl);
    event.target.value = "";
  }

  function handleSave() {
    const trimmedName = (isDraftDirty ? draftName : activePersona?.name ?? "")
      .trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    if (!activePersona) return;

    const descriptionToSave = isDraftDirty
      ? draftDescription
      : activePersona.description;

    updateMutation.mutate(
      {
        personaId: activePersona.id,
        name: trimmedName,
        description: descriptionToSave,
      },
      {
        onSuccess: (saved) => {
          resetDraftState();
          // P0: image_url 미저장 — 저장 후 DB null이면 로컬 프리뷰 초기화
          if (!saved.imageUrl) {
            clearLocalPreview();
          }
        },
      },
    );
  }

  async function handleDelete() {
    if (!activePersona) return;

    if (personas.length <= 1) {
      toast.error("At least one persona is required.");
      return;
    }

    await deleteMutation.mutateAsync(activePersona.id);

    const remainingPersonas = personas.filter(
      (persona) => persona.id !== activePersona.id,
    );
    const nextPersona =
      remainingPersonas.find((persona) => persona.isDefault) ??
      remainingPersonas[0];

    if (nextPersona) {
      setSelectedPersonaId(nextPersona.id);
      resetDraftState();
    }
  }

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-2.5 pb-1">
        <div className="h-16 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-20 animate-pulse rounded-full bg-muted/30 mx-auto w-20" />
      </div>
    );
  }

  if (isError || !activePersona) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Failed to load personas.
      </p>
    );
  }

  const isSaving =
    updateMutation.isPending ||
    setDefaultMutation.isPending ||
    deleteMutation.isPending;

  const personaInitials = getProfileInitials(displayName || activePersona.name);
  const dropdownLabel = displayName || activePersona.name;

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-1">
      {hideLabel ? null : (
        <p className="text-[11px] text-muted-foreground">Persona</p>
      )}

      <div className="relative rounded-xl bg-muted/25 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-8 w-8">
              {displayImageUrl ? (
                <AvatarImage src={displayImageUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {personaInitials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-[13px] font-medium text-foreground">
              {displayName || activePersona.name}
            </span>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              {dropdownLabel}
              <ChevronDown className="h-3 w-3" />
            </button>

            {isDropdownOpen ? (
              <div
                className="absolute right-0 z-10 mt-1 min-w-[120px] rounded-lg border border-border bg-card py-1 shadow-lg"
                role="listbox"
              >
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    role="option"
                    aria-selected={persona.id === effectivePersonaId}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-[12px] transition-colors hover:bg-muted/40",
                      persona.id === effectivePersonaId
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {persona.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted/25 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          aria-label="Upload profile image"
        >
          {displayImageUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={displayImageUrl} alt="" />
              <AvatarFallback className="bg-primary/15 text-primary">
                {personaInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageSelect}
        />
      </div>

      <div className="relative">
        <Input
          value={displayName}
          onChange={(event) => handleNameChange(event.target.value)}
          maxLength={PERSONA_NAME_MAX}
          className={cn(settingsFieldClassName, "pr-12")}
          aria-label="Persona name"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {displayName.length}/{PERSONA_NAME_MAX}
        </span>
      </div>

      <div className="relative">
        <Textarea
          value={displayDescription}
          onChange={(event) => handleDescriptionChange(event.target.value)}
          placeholder="Enter description..."
          maxLength={PERSONA_DESC_MAX}
          rows={3}
          className={cn(settingsTextareaClassName, "min-h-[88px] pb-6")}
          aria-label="Persona description"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {displayDescription.length.toLocaleString("en-US")}/
          {PERSONA_DESC_MAX.toLocaleString("en-US")}
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        className={settingsSaveButtonClassName}
        onClick={handleSave}
        disabled={isSaving}
      >
        Save
      </Button>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={personas.length <= 1 || isSaving}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
