"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ImagePlus, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  useCreateUserPersonaMutation,
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

  const personas = defaultSettings?.personas ?? [];

  if (isError || isDefaultError || !settings || personas.length === 0) {
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
      personas={personas}
    />
  );
}

function ConversationPersonaEditor({
  hideLabel,
  conversationId,
  personas,
}: {
  hideLabel: boolean;
  conversationId?: string | null;
  personas: UserPersona[];
}) {
  // 마이페이지와 동일한 전역(공통) 퍼소나 목록을 그대로 나열해 편집한다 — conversation_settings는
  // 호환성을 위해 현재 기본 퍼소나 값을 함께 써두는 스냅샷일 뿐, 표시/판단 기준은 항상 personas다.
  const updatePersonaMutation = useUpdateUserPersonaMutation();
  const createPersonaMutation = useCreateUserPersonaMutation();
  const setDefaultPersonaMutation = useSetDefaultUserPersonaMutation();
  const deletePersonaMutation = useDeleteUserPersonaMutation();
  const updateConversationMutation = useUpdateConversationSettingsMutation(conversationId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formIntent, setFormIntent] = useState<"add" | "edit">("add");
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    personaId: string;
    rect: DOMRect;
  } | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  const defaultPersonaId =
    personas.find((item) => item.isDefault)?.id ?? personas[0]?.id ?? null;
  const editingPersona = editingPersonaId
    ? (personas.find((item) => item.id === editingPersonaId) ?? null)
    : null;
  const activeMenuPersona = menuAnchor
    ? (personas.find((item) => item.id === menuAnchor.personaId) ?? null)
    : null;

  // 리스트가 스크롤되거나 창 크기가 바뀌면 fixed 좌표가 어긋나므로 그냥 닫는다
  useEffect(() => {
    if (!menuAnchor) return;

    function close() {
      setMenuAnchor(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuAnchor]);

  const trimmedDraftName = draftName.trim();
  const isSaveEnabled =
    formIntent === "add"
      ? trimmedDraftName.length > 0
      : trimmedDraftName.length > 0 &&
        (trimmedDraftName !== editingPersona?.name ||
          draftDescription !== editingPersona?.description);

  function openAddProfile() {
    setDraftName("");
    setDraftDescription("");
    setFormIntent("add");
    setEditingPersonaId(null);
    setIsFormOpen(true);
    setMenuAnchor(null);
  }

  function openEditProfile(target: UserPersona) {
    setDraftName(target.name);
    setDraftDescription(target.description);
    setFormIntent("edit");
    setEditingPersonaId(target.id);
    setIsFormOpen(true);
    setMenuAnchor(null);
  }

  function closeForm() {
    setIsFormOpen(false);
  }

  function syncConversationSnapshot(target: { name: string; description: string }) {
    updateConversationMutation.mutate({
      persona_name: target.name,
      persona_description: target.description,
    });
  }

  function handleSelect(target: UserPersona) {
    setMenuAnchor(null);
    if (target.id === defaultPersonaId) return;

    setDefaultPersonaMutation.mutate(target.id);
    syncConversationSnapshot(target);
  }

  function handleDelete(target: UserPersona) {
    setMenuAnchor(null);
    if (personas.length <= 1) {
      toast.error("At least one persona is required.");
      return;
    }

    deletePersonaMutation.mutate(target.id, {
      onSuccess: () => {
        if (target.id !== defaultPersonaId) return;

        // 서버가 다음 생성순 페르소나를 새 기본값으로 승격하므로, 대화 스냅샷도 맞춰 갱신한다
        const remaining = personas.filter((item) => item.id !== target.id);
        const next = remaining.find((item) => item.isDefault) ?? remaining[0];
        if (next) {
          syncConversationSnapshot(next);
        }
      },
    });
  }

  function handleSave() {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    if (formIntent === "add") {
      // 새 공통 페르소나를 만들고 바로 기본 페르소나로 전환한다 —
      // 여기서 만든 페르소나는 마이페이지에도 그대로 나타난다.
      createPersonaMutation.mutate(
        { name: trimmedName, description: draftDescription },
        {
          onSuccess: (created) => {
            setDefaultPersonaMutation.mutate(created.id);
            syncConversationSnapshot({ name: trimmedName, description: draftDescription });
            setIsFormOpen(false);
          },
        },
      );
      return;
    }

    if (!editingPersonaId) return;

    updatePersonaMutation.mutate(
      { personaId: editingPersonaId, name: trimmedName, description: draftDescription },
      {
        onSuccess: () => {
          if (editingPersonaId === defaultPersonaId) {
            syncConversationSnapshot({ name: trimmedName, description: draftDescription });
          }
          setIsFormOpen(false);
        },
      },
    );
  }

  if (isFormOpen) {
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
          <SettingsCancelButton onClick={closeForm} />
          <SettingsSaveButton
            label={formIntent === "edit" ? "Save" : "Add persona"}
            enabled={
              isSaveEnabled &&
              !updatePersonaMutation.isPending &&
              !createPersonaMutation.isPending
            }
            onClick={handleSave}
          />
        </SettingsFormActions>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-1">
      {hideLabel ? null : (
        <p className="text-xs text-muted-foreground">Persona</p>
      )}

      <div className="max-h-64 divide-y divide-border/50 overflow-y-auto rounded-xl border border-white/40 bg-muted/25">
        {personas.map((item) => {
          const isCurrent = item.id === defaultPersonaId;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-black">
                    Current
                  </span>
                ) : null}
                <span className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  if (menuAnchor?.personaId === item.id) {
                    setMenuAnchor(null);
                    return;
                  }
                  setMenuAnchor({
                    personaId: item.id,
                    rect: event.currentTarget.getBoundingClientRect(),
                  });
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="Persona options"
                aria-haspopup="menu"
                aria-expanded={menuAnchor?.personaId === item.id}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={openAddProfile}
        className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/30"
      >
        Add new persona
      </button>

      {menuAnchor && activeMenuPersona
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuAnchor(null)}
                aria-hidden
              />
              <div
                role="menu"
                className="fixed z-50 min-w-[110px] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
                style={{
                  top: menuAnchor.rect.bottom + 4,
                  right: Math.max(8, window.innerWidth - menuAnchor.rect.right),
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openEditProfile(activeMenuPersona)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
                >
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleDelete(activeMenuPersona)}
                  disabled={personas.length <= 1}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

function GlobalPersonaSettings({ hideLabel = false }: { hideLabel?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const { data: settings, isPending, isError } = useDefaultSettingsQuery();
  const updateMutation = useUpdateUserPersonaMutation();
  const createMutation = useCreateUserPersonaMutation();
  const setDefaultMutation = useSetDefaultUserPersonaMutation();
  const deleteMutation = useDeleteUserPersonaMutation();

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isDraftDirty, setIsDraftDirty] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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
    setIsCreating(false);
    setDraftName("");
    setDraftDescription("");
    clearLocalPreview();
  }

  function openCreateForm() {
    clearLocalPreview();
    setDraftName("");
    setDraftDescription("");
    setIsDraftDirty(true);
    setIsCreating(true);
    setIsDropdownOpen(false);
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

    if (isCreating) {
      createMutation.mutate(
        { name: trimmedName, description: draftDescription },
        {
          onSuccess: (created) => {
            resetDraftState();
            setSelectedPersonaId(created.id);
            setDefaultMutation.mutate(created.id);
          },
        },
      );
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
    createMutation.isPending ||
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
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="block w-full px-3 py-2 text-left text-[12px] font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  + Add new persona
                </button>
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
        {isCreating ? (
          <SettingsCancelButton onClick={resetDraftState} />
        ) : null}
        <SettingsSaveButton
          label={isCreating ? "Add persona" : "Save"}
          enabled={isSaveEnabled && !isSaving}
          onClick={handleSave}
        />
      </SettingsFormActions>

      {isCreating ? null : (
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
      )}
    </div>
  );
}
