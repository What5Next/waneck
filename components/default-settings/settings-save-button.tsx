"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Save 버튼 묶음의 공통 여백 — 위 필드와의 간격을 화면마다 다시 정의하지 말 것 */
export function SettingsFormActions({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex gap-2">{children}</div>;
}

type SettingsSaveButtonProps = {
  label?: string;
  enabled: boolean;
  onClick: () => void;
};

/** Memory/Notes/Persona가 공유하는 저장 버튼 스타일 */
export function SettingsSaveButton({
  label = "Save",
  enabled,
  onClick,
}: SettingsSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className={cn(
        "flex-1 rounded-xl py-3 text-sm font-semibold transition-colors",
        enabled
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

/** Persona 편집 폼의 취소 버튼 — Save와 나란히 쓰인다 */
export function SettingsCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/70"
    >
      Cancel
    </button>
  );
}
