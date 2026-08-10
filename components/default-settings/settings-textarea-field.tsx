"use client";

import { Textarea } from "@/components/ui/textarea";
import { settingsTextareaClassName } from "@/components/default-settings/settings-field-classes";
import { cn } from "@/lib/utils";

/** Memory/Notes 등 "긴 자유 텍스트" 필드의 기본 높이 — 화면마다 다시 정의하지 말 것 */
export const SETTINGS_TEXTAREA_DEFAULT_ROWS = 6;
export const SETTINGS_TEXTAREA_DEFAULT_MAX_HEIGHT = "max-h-48";

type SettingsTextareaFieldProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  rows?: number;
  maxHeightClassName?: string;
  "aria-label": string;
};

/** 카운터가 붙은 설정 화면 공통 textarea — Memory/Notes/Persona Info가 이 컴포넌트를 공유한다 */
export function SettingsTextareaField({
  value,
  onChange,
  maxLength,
  placeholder,
  rows = SETTINGS_TEXTAREA_DEFAULT_ROWS,
  maxHeightClassName = SETTINGS_TEXTAREA_DEFAULT_MAX_HEIGHT,
  "aria-label": ariaLabel,
}: SettingsTextareaFieldProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          settingsTextareaClassName,
          "scroll-thumb-only overflow-y-auto",
          maxHeightClassName,
        )}
        aria-label={ariaLabel}
      />
      <div className="mt-1 flex justify-end">
        <span className="text-xs text-muted-foreground">
          {value.length.toLocaleString("en-US")}/
          {maxLength.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}
