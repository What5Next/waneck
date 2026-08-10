"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ImagePlus, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  useDeleteUserPersonaMutation,
  useSetDefaultUserPersonaMutation,
  useUpdateUserPersonaMutation,
} from "@/hooks/mutations/use-user-persona-mutations";
import { useUpdateConversationSettingsMutation } from "@/hooks/mutations/use-update-conversation-settings-mutation";
import { useConversationSettingsQuery } from "@/hooks/queries/use-conversation-settings-query";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import { getDefaultPersona, type UserPersona } from "@/lib/api/user-settings";
import {
  PERSONA_DESC_MAX,
  PERSONA_NAME_MAX,
} from "@/lib/user-default-settings/constants";
import { settingsFieldClassName } from "@/components/default-settings/settings-field-classes";
import { SettingsTextareaField } from "@/components/default-settings/settings-textarea-field";
import {
  SettingsCancelButton,
  SettingsFormActions,
  SettingsSaveButton,
} from "@/components/default-settings/settings-save-button";
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
  // 퍼소나는 마이페이지(전역 user_personas)와 동기화되므로 여기서도 함께 로드한다
  const {
    data: defaultSettings,
    isPending: isDefaultPending,
    isError: isDefaultError,
  } = useDefaultSettingsQuery();

  if (isPending || isDefaultPending) {
    return (
      <div className="w-full min-w-0 space-y-2.5 pb-1">
        <div className="h-16 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-20 animate-pulse rounded-full bg-muted/30 mx-auto w-20" />
      </div>
    );
  }

  const persona = defaultSettings ? getDefaultPersona(defaultSettings) : null;

  if (isError || isDefaultError || !settings || !persona) {
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
      persona={persona}
    />
  );
}

function ConversationPersonaEditor({
  hideLabel,
  conversationId,
  persona,
}: {
  hideLabel: boolean;
  conversationId?: string | null;
  persona: UserPersona;
}) {
  // 마이페이지와 동일한 전역 퍼소나를 원본으로 편집한다 — conversation_settings는
  // 호환성을 위해 같은 값을 함께 써두는 스냅샷일 뿐, 표시/판단 기준은 항상 persona다.
  const updatePersonaMutation = useUpdateUserPersonaMutation();
  const updateConversationMutation = useUpdateConversationSettingsMutation(conversationId);
  const [draftName, setDraftName] = useState(() => persona.name);
  const [draftDescription, setDraftDescription] = useState(
    () => persona.description,
  );

  const hasPersona = persona.name.trim().length > 0;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIntent, setFormIntent] = useState<"add" | "edit">("add");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const trimmedDraftName = draftName.trim();
  const isSaveEnabled =
    trimmedDraftName.length > 0 &&
    (trimmedDraftName !== persona.name ||
      draftDescription !== persona.description);

  const isEditingExisting = hasPersona && formIntent === "edit";

  function openAddProfile() {
    setDraftName("");
    setDraftDescription("");
    setFormIntent("add");
    setIsFormOpen(true);
    setIsMenuOpen(false);
  }

  function openEditProfile() {
    setDraftName(persona.name);
    setDraftDescription(persona.description);
    setFormIntent("edit");
    setIsFormOpen(true);
    setIsMenuOpen(false);
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  function handleDelete() {
    setIsMenuOpen(false);
    updatePersonaMutation.mutate(
      { personaId: persona.id, name: "", description: "" },
      {
        onSuccess: () => {
          toast.success("Persona removed.");
          setIsFormOpen(false);
        },
      },
    );
    updateConversationMutation.mutate({
      persona_name: "",
      persona_description: "",
    });
  }

  function handleSave() {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    updatePersonaMutation.mutate(
      { personaId: persona.id, name: trimmedName, description: draftDescription },
      {
        onSuccess: () => {
          toast.success(
            isEditingExisting
              ? "Persona saved for this chat."
              : "Persona created for this chat.",
          );
          setIsFormOpen(false);
        },
      },
    );
    updateConversationMutation.mutate({
      persona_name: trimmedName,
      persona_description: draftDescription,
    });
  }

  if (!hasPersona || isFormOpen) {
    return (
      <div className="w-full min-w-0 space-y-5 pb-1">
        <div className="space-y-1.5">
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
            Name <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Enter how you&apos;d like to be called in the story.
          </p>
          <div className="relative">
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={PERSONA_NAME_MAX}
              placeholder="My name"
              className={cn(settingsFieldClassName, "pr-14")}
              aria-label="Persona name"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {draftName.length}/{PERSONA_NAME_MAX}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">Info</p>
          <p className="text-xs text-muted-foreground">
            Enter info about yourself to reflect in the story.
          </p>
          <SettingsTextareaField
            value={draftDescription}
            onChange={setDraftDescription}
            maxLength={PERSONA_DESC_MAX}
            placeholder="Age, gender, appearance, etc."
            rows={5}
            maxHeightClassName="max-h-40"
            aria-label="Persona info"
          />
        </div>

        <SettingsFormActions>
          {hasPersona ? <SettingsCancelButton onClick={closeForm} /> : null}
          <SettingsSaveButton
            label={isEditingExisting ? "Save" : "Add persona"}
            enabled={isSaveEnabled && !updatePersonaMutation.isPending}
            onClick={handleSave}
          />
        </SettingsFormActions>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-1">
      {hideLabel ? null : (
        <p className="text-xs text-muted-foreground">This chat persona</p>
      )}

      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/40 bg-muted/25 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-black">
            Current
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {persona.name}
          </span>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="Persona options"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <div
              className="absolute right-0 z-10 mt-1 min-w-[110px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openEditProfile}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
              >
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={openAddProfile}
        className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/30"
      >
        Add profile
      </button>
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

  const trimmedGlobalName = (
    isDraftDirty ? draftName : (activePersona?.name ?? "")
  ).trim();
  const isSaveEnabled =
    trimmedGlobalName.length > 0 && (isDraftDirty || localPreviewUrl !== null);

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

      <SettingsTextareaField
        value={displayDescription}
        onChange={handleDescriptionChange}
        maxLength={PERSONA_DESC_MAX}
        placeholder="Enter description..."
        rows={3}
        maxHeightClassName="max-h-24"
        aria-label="Persona description"
      />

      <SettingsFormActions>
        <SettingsSaveButton
          enabled={isSaveEnabled && !isSaving}
          onClick={handleSave}
        />
      </SettingsFormActions>

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
