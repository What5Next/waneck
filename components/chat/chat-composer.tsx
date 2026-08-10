"use client";

import { useRef, useEffect } from "react";
import type { KeyboardEventHandler } from "react";
import { ArrowUp, Asterisk, Play, WandSparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
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
  /** 캐릭터 추천 대화 — 채팅창 안에 칩으로 표시 */
  suggestions?: string[];
  /** Suggested Response 버튼 — 클릭 시 채팅 하단에 추천 답변 3개 요청 */
  onRequestSuggestions?: () => void;
  isFetchingSuggestions?: boolean;
  /** 입력값이 비어 있을 때 뜨는 자동 진행 버튼 — 클릭 시 캐릭터가 맥락에 맞게 스토리를 이어감 */
  onAutoPlay?: () => void;
  isAutoPlaying?: boolean;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  model,
  onModelChange,
  showModelSelector = true,
  suggestions = [],
  onRequestSuggestions,
  isFetchingSuggestions = false,
  onAutoPlay,
  isAutoPlaying = false,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const hasText = value.trim().length > 0;
  const canSend = !disabled && hasText;
  const canAutoPlay = !disabled && !isAutoPlaying;

  return (
    <FadeEdge
      top
      size={COMPOSER_FADE_SIZE}
      fadeColor="background"
      className="relative z-10 shrink-0 bg-background"
    >
      <div className="px-3 pb-4 pt-3">
        {recommendedReplies.length > 0 ? (
          <div className="mx-auto mb-2 flex w-full max-w-[46rem] gap-1.5 overflow-x-auto scroll-hide">
            {recommendedReplies.map((reply, index) => (
              <button
                key={`${reply}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => applyRecommendedReply(reply)}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[46rem] rounded-2xl bg-card">
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
              <IconButton
                size="md"
                disabled={disabled}
                aria-label="Describe situation"
                onClick={insertActionMarkers}
                className="h-[34px] w-[34px] border border-white/20"
              >
                <Asterisk className="h-5 w-5" strokeWidth={1.5} />
              </IconButton>

              {onRequestSuggestions ? (
                <IconButton
                  size="md"
                  disabled={disabled || isFetchingSuggestions}
                  aria-label="Suggested response"
                  onClick={onRequestSuggestions}
                  className="h-[34px] w-[34px] border border-white/20"
                >
                  <WandSparkles
                    className={cn("h-5 w-5", isFetchingSuggestions && "animate-pulse")}
                    strokeWidth={1.5}
                  />
                </IconButton>
              ) : null}

              {showModelSelector && (
                <ModelSelector value={model} onChange={onModelChange} compact />
              )}
            </div>
            {!hasText && onAutoPlay ? (
              <Button
                type="button"
                size="icon"
                aria-label="Auto-play"
                className={cn(
                  "h-[34px] w-[34px] shrink-0 rounded-full bg-white text-black transition-colors hover:bg-white/90",
                  isAutoPlaying && "animate-pulse",
                )}
                disabled={!canAutoPlay}
                onClick={onAutoPlay}
              >
                <Play className="h-4 w-4 fill-black" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                aria-label="Send"
                className={cn(
                  "h-[34px] w-[34px] shrink-0 rounded-full transition-colors",
                  canSend
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
                disabled={!canSend}
                onClick={onSubmit}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FadeEdge>
  );
}
