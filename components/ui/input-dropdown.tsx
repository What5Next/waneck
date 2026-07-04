"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { inputVariants } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputDropdownOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

type InputDropdownProps<T extends string = string> = {
  value: T;
  options: InputDropdownOption<T>[];
  onValueChange: (value: T) => void;
  placeholder?: string;
  /** input: Input과 동일 스타일, pill: 작은 칩형 */
  variant?: "input" | "pill";
  disabled?: boolean;
  className?: string;
  /** 트리거(버튼) className */
  triggerClassName?: string;
  /** 리스트 하단 액션 (+ New 등) */
  footerAction?: {
    label: ReactNode;
    onClick: () => void;
  };
  "aria-label"?: string;
};

export function InputDropdown<T extends string = string>({
  value,
  options,
  onValueChange,
  placeholder = "Select…",
  variant = "input",
  disabled = false,
  className,
  triggerClassName,
  footerAction,
  "aria-label": ariaLabel,
}: InputDropdownProps<T>) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(optionValue: T) {
    onValueChange(optionValue);
    setIsOpen(false);
  }

  const isInputVariant = variant === "input";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isInputVariant ? "w-full min-w-0" : "inline-flex",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={cn(
          isInputVariant
            ? cn(
                inputVariants({ variant: "default" }),
                "flex items-center justify-between gap-2 pr-3 text-left",
              )
            : "inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            isInputVariant && !selectedOption && "text-muted-foreground/50",
            isInputVariant && selectedOption && "text-[13px]",
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            isInputVariant ? "h-4 w-4" : "h-3 w-3",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            // py 제거: hover/selected 배경이 상단에 안 남는 풀블리드
            "absolute z-10 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_28px_rgba(0,0,0,0.45)]",
            isInputVariant
              ? "left-0 right-0 w-full"
              : "right-0 min-w-[160px]",
          )}
        >
          <div className="scroll-hide max-h-[220px] overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-[12px] text-muted-foreground">
                No options
              </p>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/40",
                      isSelected
                        ? "bg-muted/25 font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate",
                          isInputVariant ? "text-[13px]" : "text-[12px]",
                        )}
                      >
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {footerAction ? (
            <>
              <div className="border-t border-border" aria-hidden />
              <button
                type="button"
                onClick={() => {
                  footerAction.onClick();
                  setIsOpen(false);
                }}
                className="block w-full px-3 py-2.5 text-left text-[12px] font-medium text-primary transition-colors hover:bg-muted/40"
              >
                {footerAction.label}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
