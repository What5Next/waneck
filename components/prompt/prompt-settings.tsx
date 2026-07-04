"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputDropdown } from "@/components/ui/input-dropdown";
import { Textarea } from "@/components/ui/textarea";

export type UserPrompt = {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
};

// API 연동 전 UI 프리뷰용 mock
const MOCK_PROMPTS: UserPrompt[] = [
  {
    id: "default",
    title: "Prompt V5",
    content: "[V5] A default prompt suitable for all chats.",
    isDefault: true,
  },
];

const PROMPT_TITLE_MAX = 50;
const PROMPT_CONTENT_MAX = 8000;

type PromptView = "summary" | "editor";

type PromptSettingsProps = {
  /** summary: 카드 → 편집 2depth, editor: 편집 화면만 (mypage 등) */
  initialView?: PromptView;
  /** summary일 때 카드 아래에 렌더 (Output 탭의 모델/빌링 등) */
  secondarySections?: ReactNode;
  /** 모달 타이틀 등과 중복될 때 섹션 라벨 숨김 */
  hideLabel?: boolean;
};

export function PromptSettings({
  initialView = "summary",
  secondarySections,
  hideLabel = false,
}: PromptSettingsProps) {
  const [view, setView] = useState<PromptView>(initialView);
  const [prompts, setPrompts] = useState<UserPrompt[]>(() =>
    MOCK_PROMPTS.map((prompt) => ({ ...prompt })),
  );
  const [activePromptId, setActivePromptId] = useState(MOCK_PROMPTS[0].id);
  const [draftTitle, setDraftTitle] = useState(MOCK_PROMPTS[0].title);
  const [draftContent, setDraftContent] = useState(MOCK_PROMPTS[0].content);

  const activePrompt =
    prompts.find((prompt) => prompt.id === activePromptId) ?? prompts[0];

  const promptOptions = prompts.map((prompt) => ({
    value: prompt.id,
    label: prompt.isDefault ? `${prompt.title} (Default)` : prompt.title,
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
  }

  function handleSave() {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      toast.error("Title is required.");
      return;
    }

    if (!activePrompt) return;

    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) =>
        prompt.id === activePrompt.id
          ? {
              ...prompt,
              title: trimmedTitle,
              content: draftContent,
            }
          : prompt,
      ),
    );
    toast.success("Prompt saved.");
  }

  function handleSetAsDefault() {
    if (!activePrompt) return;

    if (activePrompt.isDefault) {
      toast.message("Already set as default.");
      return;
    }

    setPrompts((prevPrompts) =>
      prevPrompts.map((prompt) => ({
        ...prompt,
        isDefault: prompt.id === activePrompt.id,
      })),
    );
    toast.success("Set as default.");
  }

  function handleDelete() {
    if (!activePrompt) return;

    if (prompts.length <= 1) {
      toast.error("At least one prompt is required.");
      return;
    }

    const remainingPrompts = prompts.filter(
      (prompt) => prompt.id !== activePrompt.id,
    );

    // 기본 프롬프트를 지우면 남은 첫 항목을 기본으로 승격
    if (activePrompt.isDefault && remainingPrompts.length > 0) {
      remainingPrompts[0] = { ...remainingPrompts[0], isDefault: true };
    }

    const nextPrompt = remainingPrompts[0];
    setPrompts(remainingPrompts);
    setActivePromptId(nextPrompt.id);
    applyPromptToDraft(nextPrompt);
    toast.success("Prompt deleted.");
  }

  function handleCreate() {
    const newPrompt: UserPrompt = {
      id: `prompt-${Date.now()}`,
      title: "New prompt",
      content: "",
      isDefault: false,
    };

    setPrompts((prevPrompts) => [...prevPrompts, newPrompt]);
    setActivePromptId(newPrompt.id);
    applyPromptToDraft(newPrompt);
    setView("editor");
  }

  if (!activePrompt) return null;

  // depth 2: 타이틀/본문 편집
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
          value={activePromptId}
          options={promptOptions}
          onValueChange={handleSelectPrompt}
          aria-label="Select prompt"
          triggerClassName="border-0"
          footerAction={{
            label: "+ New prompt",
            onClick: handleCreate,
          }}
        />

        <div className="relative">
          <Input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            maxLength={PROMPT_TITLE_MAX}
            placeholder="Title"
            className="border-0 pr-12 text-[13px]"
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
            className="min-h-[140px] border-0 pb-6 text-[13px]"
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
          className="h-10 w-full rounded-xl border-0 text-[13px]"
          onClick={handleSave}
        >
          Save
        </Button>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSetAsDefault}
            disabled={activePrompt.isDefault}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Star className="h-3.5 w-3.5" />
            Set as Default
          </button>
          <span className="h-3.5 w-px bg-border" aria-hidden />
          <button
            type="button"
            onClick={handleDelete}
            disabled={prompts.length <= 1}
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    );
  }

  // depth 1: 현재 프롬프트 요약 카드
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
