"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputDropdown } from "@/components/ui/input-dropdown";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateUserPromptMutation,
  useDeleteUserPromptMutation,
  useSetDefaultUserPromptMutation,
  useUpdateUserPromptMutation,
} from "@/hooks/mutations/use-user-prompt-mutations";
import { useDefaultSettingsQuery } from "@/hooks/queries/use-default-settings-query";
import { PROMPT_CONTENT_MAX, PROMPT_TITLE_MAX } from "@/lib/user-default-settings/constants";
import {
  settingsFieldClassName,
  settingsSaveButtonClassName,
  settingsTextareaClassName,
} from "@/components/default-settings/settings-field-classes";
import {
  getDefaultPrompt,
  type UserPrompt,
} from "@/lib/api/user-settings";
import { cn } from "@/lib/utils";

export type { UserPrompt };

type PromptView = "summary" | "editor";

type PromptSettingsProps = {
  initialView?: PromptView;
  secondarySections?: ReactNode;
  hideLabel?: boolean;
};

export function PromptSettings({
  initialView = "summary",
  secondarySections,
  hideLabel = false,
}: PromptSettingsProps) {
  const { data: settings, isPending, isError } = useDefaultSettingsQuery();
  const createMutation = useCreateUserPromptMutation();
  const updateMutation = useUpdateUserPromptMutation();
  const setDefaultMutation = useSetDefaultUserPromptMutation();
  const deleteMutation = useDeleteUserPromptMutation();

  const [view, setView] = useState<PromptView>(initialView);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const prompts = settings?.prompts ?? [];

  useEffect(() => {
    if (!settings || prompts.length === 0) {
      return;
    }

    const currentExists = activePromptId
      ? prompts.some((prompt) => prompt.id === activePromptId)
      : false;

    if (currentExists) {
      return;
    }

    const initialPrompt = getDefaultPrompt(settings);
    if (!initialPrompt) {
      return;
    }

    setActivePromptId(initialPrompt.id);
    setDraftTitle(initialPrompt.title);
    setDraftContent(initialPrompt.content);
  }, [settings, prompts, activePromptId]);

  const activePrompt =
    prompts.find((prompt) => prompt.id === activePromptId) ?? prompts[0];

  const promptOptions = prompts.map((prompt) => ({
    value: prompt.id,
    label: prompt.title,
    description: prompt.content || undefined,
  }));

  function applyPromptToDraft(prompt: UserPrompt) {
    setDraftTitle(prompt.title);
    setDraftContent(prompt.content);
  }

  function handleSelectPrompt(promptId: string) {
    const selectedPrompt = prompts.find((prompt) => prompt.id === promptId);
    if (!selectedPrompt) return;

    setActivePromptId(promptId);
    applyPromptToDraft(selectedPrompt);

    // 드롭다운 선택 = default prompt 즉시 전환
    if (!selectedPrompt.isDefault) {
      setDefaultMutation.mutate(promptId);
    }
  }

  function handleSave() {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title is required.");
      return;
    }

    if (!activePrompt) return;

    updateMutation.mutate({
      promptId: activePrompt.id,
      title: trimmedTitle,
      content: draftContent,
    });
  }

  async function handleDelete() {
    if (!activePrompt) return;

    if (prompts.length <= 1) {
      toast.error("At least one prompt is required.");
      return;
    }

    await deleteMutation.mutateAsync(activePrompt.id);

    const remainingPrompts = prompts.filter(
      (prompt) => prompt.id !== activePrompt.id,
    );
    const nextPrompt =
      remainingPrompts.find((prompt) => prompt.isDefault) ?? remainingPrompts[0];

    if (nextPrompt) {
      setActivePromptId(nextPrompt.id);
      applyPromptToDraft(nextPrompt);
    }
  }

  async function handleCreate() {
    const created = await createMutation.mutateAsync();
    setActivePromptId(created.id);
    applyPromptToDraft(created);
    setView("editor");
  }

  if (isPending) {
    return (
      <div className="w-full min-w-0 space-y-2.5 pb-1">
        <div className="h-10 animate-pulse rounded-xl bg-muted/30" />
        <div className="h-24 animate-pulse rounded-xl bg-muted/30" />
      </div>
    );
  }

  if (isError || !activePrompt) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Failed to load prompts.
      </p>
    );
  }

  const isSaving =
    updateMutation.isPending ||
    setDefaultMutation.isPending ||
    deleteMutation.isPending ||
    createMutation.isPending;

  if (view === "editor") {
    return (
      <div className="w-full min-w-0 space-y-2.5 pb-1">
        {initialView === "summary" ? (
          <button
            type="button"
            onClick={() => setView("summary")}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Prompt
          </button>
        ) : hideLabel ? null : (
          <p className="text-[11px] text-muted-foreground">Prompt</p>
        )}

        <InputDropdown
          value={activePromptId ?? activePrompt.id}
          options={promptOptions}
          onValueChange={handleSelectPrompt}
          aria-label="Select prompt"
          triggerClassName={settingsFieldClassName}
          footerAction={{
            label: "+ New prompt",
            onClick: () => void handleCreate(),
          }}
        />

        <div className="relative">
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={PROMPT_TITLE_MAX}
            placeholder="Title"
            className={cn(settingsFieldClassName, "pr-12")}
            aria-label="Prompt title"
          />
          <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
            {draftTitle.length}/{PROMPT_TITLE_MAX}
          </span>
        </div>

        <div className="relative">
          <Textarea
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            placeholder="Enter prompt..."
            maxLength={PROMPT_CONTENT_MAX}
            rows={6}
            className={cn(settingsTextareaClassName, "min-h-[140px] pb-6")}
            aria-label="Prompt content"
          />
          <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
            {draftContent.length.toLocaleString("en-US")}/
            {PROMPT_CONTENT_MAX.toLocaleString("en-US")}
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
            disabled={prompts.length <= 1 || isSaving}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4 pb-1">
      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">Prompt</p>
        <button
          type="button"
          onClick={() => setView("editor")}
          className="flex w-full items-center gap-2 rounded-xl bg-muted/25 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <span className="truncate text-[13px] font-medium text-foreground">
              {activePrompt.title}
            </span>
            {activePrompt.content ? (
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {activePrompt.content}
              </p>
            ) : null}
          </div>
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
            aria-hidden
          />
        </button>
      </div>
      {secondarySections}
    </div>
  );
}
