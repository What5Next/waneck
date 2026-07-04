"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

export type Persona = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isDefault: boolean;
};

// API 연동 전 UI 프리뷰용 mock
const MOCK_PERSONAS: Persona[] = [
  {
    id: "default",
    name: "Jin Choi",
    description: "",
    imageUrl: null,
    isDefault: true,
  },
];

const PERSONA_NAME_MAX = 50;
const PERSONA_DESC_MAX = 4000;

type PersonaSettingsProps = {
  /** 모달 타이틀 등과 중복될 때 섹션 라벨 숨김 */
  hideLabel?: boolean;
};

export function PersonaSettings({ hideLabel = false }: PersonaSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const [personas, setPersonas] = useState<Persona[]>(() =>
    MOCK_PERSONAS.map((persona) => ({ ...persona })),
  );
  const [activePersonaId, setActivePersonaId] = useState(MOCK_PERSONAS[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [draftName, setDraftName] = useState(MOCK_PERSONAS[0].name);
  const [draftDescription, setDraftDescription] = useState(
    MOCK_PERSONAS[0].description,
  );
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(
    MOCK_PERSONAS[0].imageUrl,
  );

  const activePersona =
    personas.find((persona) => persona.id === activePersonaId) ?? personas[0];

  // object URL 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function applyPersonaToDraft(persona: Persona) {
    setDraftName(persona.name);
    setDraftDescription(persona.description);
    setDraftImageUrl(persona.imageUrl);
  }

  function revokePreviewUrl() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }

  function handleSelectPersona(personaId: string) {
    const selectedPersona = personas.find(
      (persona) => persona.id === personaId,
    );
    if (!selectedPersona) return;

    setActivePersonaId(personaId);
    applyPersonaToDraft(selectedPersona);
    setIsDropdownOpen(false);
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Image file only.");
      event.target.value = "";
      return;
    }

    revokePreviewUrl();
    const objectUrl = URL.createObjectURL(selectedFile);
    previewObjectUrlRef.current = objectUrl;
    setDraftImageUrl(objectUrl);
    event.target.value = "";
  }

  function handleSave() {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    if (!activePersona) return;

    setPersonas((prevPersonas) =>
      prevPersonas.map((persona) =>
        persona.id === activePersona.id
          ? {
              ...persona,
              name: trimmedName,
              description: draftDescription,
              imageUrl: draftImageUrl,
            }
          : persona,
      ),
    );
    toast.success("Persona saved.");
  }

  function handleSetAsDefault() {
    if (!activePersona) return;

    if (activePersona.isDefault) {
      toast.message("Already set as default.");
      return;
    }

    setPersonas((prevPersonas) =>
      prevPersonas.map((persona) => ({
        ...persona,
        isDefault: persona.id === activePersona.id,
      })),
    );
    toast.success("Set as default.");
  }

  function handleDelete() {
    if (!activePersona) return;

    if (personas.length <= 1) {
      toast.error("At least one persona is required.");
      return;
    }

    const remainingPersonas = personas.filter(
      (persona) => persona.id !== activePersona.id,
    );

    if (activePersona.isDefault && remainingPersonas.length > 0) {
      remainingPersonas[0] = { ...remainingPersonas[0], isDefault: true };
    }

    const nextPersona = remainingPersonas[0];
    setPersonas(remainingPersonas);
    setActivePersonaId(nextPersona.id);
    applyPersonaToDraft(nextPersona);
    toast.success("Persona deleted.");
  }

  if (!activePersona) return null;

  const personaInitials = getProfileInitials(draftName || activePersona.name);
  const dropdownLabel = activePersona.isDefault
    ? "Default"
    : activePersona.name;

  return (
    <div className="w-full min-w-0 space-y-2.5 pb-1">
      {hideLabel ? null : (
        <p className="text-[11px] text-muted-foreground">Persona</p>
      )}

      <div className="relative rounded-xl bg-muted/25 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-8 w-8">
              {draftImageUrl ? (
                <AvatarImage src={draftImageUrl} alt={draftName} />
              ) : null}
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {personaInitials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-[13px] font-medium text-foreground">
              {draftName || activePersona.name}
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
                    aria-selected={persona.id === activePersonaId}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-[12px] transition-colors hover:bg-muted/40",
                      persona.id === activePersonaId
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {persona.isDefault ? "Default" : persona.name}
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
          {draftImageUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={draftImageUrl} alt="" />
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
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          maxLength={PERSONA_NAME_MAX}
          className="border-0 pr-12 text-[13px]"
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
          className="min-h-[88px] border-0 pb-6 text-[13px]"
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
        className="h-10 w-full rounded-xl border-0 text-[13px]"
        onClick={handleSave}
      >
        Save
      </Button>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSetAsDefault}
          disabled={activePersona.isDefault}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Star className="h-3.5 w-3.5" />
          Set as Default
        </button>
        <span className="h-3.5 w-px bg-border" aria-hidden />
        <button
          type="button"
          onClick={handleDelete}
          disabled={personas.length <= 1}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
