"use client";

import { useRef, useEffect, useState } from "react";
import type { KeyboardEventHandler } from "react";
import { SendHorizonal, Plus, Asterisk, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuDivider,
  PopoverMenuItem,
  PopoverMenuOption,
  PopoverMenuSection,
  PopoverMenuTrigger,
  usePopoverMenu,
} from "@/components/ui/popover-menu";
import { ModelSelector, type ModelId } from "@/components/chat/model-selector";
import { FadeEdge } from "@/components/ui/fade-edge";

/** composer 상단 fade 높이 */
const COMPOSER_FADE_SIZE = 16;

export type ChatComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  showModelSelector?: boolean;
  /** 캐릭터 추천 대화 — 추천 답변 메뉴에 표시 */
  suggestions?: string[];
};

function ComposerPlusMenu({
  disabled,
  recommendedReplies,
  onInsertActionMarkers,
  onApplyRecommendedReply,
}: {
  disabled: boolean;
  recommendedReplies: string[];
  onInsertActionMarkers: () => void;
  onApplyRecommendedReply: (text: string) => void;
}) {
  const { setOpen } = usePopoverMenu();

  return (
    <PopoverMenuContent side="top" align="start" width="sm">
      <PopoverMenuItem
        icon={<Asterisk className="h-4 w-4" strokeWidth={1.5} />}
        label="Action"
        description="Insert as *action*"
        disabled={disabled}
        onClick={() => {
          onInsertActionMarkers();
          setOpen(false);
        }}
      />

      <PopoverMenuDivider />

      <PopoverMenuSection
        title="Suggested replies"
        titleIcon={
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
        }
      >
        {recommendedReplies.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {recommendedReplies.map((reply, index) => (
              <PopoverMenuOption
                key={`${reply}-${index}`}
                disabled={disabled}
                onClick={() => {
                  onApplyRecommendedReply(reply);
                  setOpen(false);
                }}
              >
                {reply}
              </PopoverMenuOption>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            No suggested replies yet
          </p>
        )}
      </PopoverMenuSection>
    </PopoverMenuContent>
  );
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  model,
  onModelChange,
  showModelSelector = true,
  suggestions = [],
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const recommendedReplies = suggestions.filter(
    (text) => text.trim().length > 0,
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    if (!disabled && value.trim().length > 0) {
      onSubmit();
    }
  };

  function insertActionMarkers() {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let newValue: string;
    let newCursor: number;

    if (selected) {
      newValue =
        value.slice(0, start) + "*" + selected + "*" + value.slice(end);
      newCursor = end + 2;
    } else {
      newValue = value.slice(0, start) + "**" + value.slice(start);
      newCursor = start + 1;
    }

    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursor, newCursor);
    });
  }

  function applyRecommendedReply(text: string) {
    onChange(text);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <FadeEdge
      top
      size={COMPOSER_FADE_SIZE}
      fadeColor="background"
      className="relative z-10 shrink-0 bg-background"
    >
      <div className="px-3 pb-4 pt-3">
        <div className="rounded-2xl bg-card">
          <textarea
            ref={textareaRef}
            className="scroll-hide max-h-[120px] w-full resize-none overflow-y-auto bg-transparent px-4 pt-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            onChange={(ev) => onChange(ev.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message"
            rows={1}
          />
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-1">
              <PopoverMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverMenuTrigger asChild>
                  <IconButton
                    size="md"
                    disabled={disabled}
                    aria-label="More options"
                  >
                    <Plus className="h-5 w-5" strokeWidth={1.5} />
                  </IconButton>
                </PopoverMenuTrigger>

                <ComposerPlusMenu
                  disabled={disabled}
                  recommendedReplies={recommendedReplies}
                  onInsertActionMarkers={insertActionMarkers}
                  onApplyRecommendedReply={applyRecommendedReply}
                />
              </PopoverMenu>

              {showModelSelector && (
                <ModelSelector value={model} onChange={onModelChange} compact />
              )}
            </div>
            <Button
              type="button"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0 rounded-lg transition-colors",
                canSend
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
              disabled={!canSend}
              onClick={onSubmit}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </FadeEdge>
  );
}
