"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// API 연동 전 UI 프리뷰용 mock
const SESSION_NOTE_MAX = 2000;
const MOCK_SESSION_NOTE = "";

type UserNotesSettingsProps = {
  /** 모달 타이틀 등과 중복될 때 섹션 라벨 숨김 */
  hideLabel?: boolean;
};

export function UserNotesSettings({
  hideLabel = false,
}: UserNotesSettingsProps) {
  const [sessionNote, setSessionNote] = useState(MOCK_SESSION_NOTE);
  const [draftNote, setDraftNote] = useState(MOCK_SESSION_NOTE);

  function handleEditSave() {
    setSessionNote(draftNote);
    toast.success("Note saved.");
  }

  return (
    <div className="w-full min-w-0 space-y-3 pb-1">
      {hideLabel ? null : (
        <p className="text-[11px] text-muted-foreground">Session Note</p>
      )}

      <div className="relative">
        <Textarea
          value={draftNote}
          onChange={(event) => setDraftNote(event.target.value)}
          placeholder="Please provide user note."
          maxLength={SESSION_NOTE_MAX}
          rows={5}
          className="min-h-[120px] border-0 pb-6 text-[13px]"
          aria-label="Session note"
        />
        <span className="pointer-events-none absolute right-3 bottom-3 text-[10px] text-muted-foreground">
          {draftNote.length.toLocaleString("en-US")}/
          {SESSION_NOTE_MAX.toLocaleString("en-US")}
        </span>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="h-10 w-full rounded-xl border-0 text-[13px]"
        onClick={handleEditSave}
      >
        Edit Save
      </Button>
    </div>
  );
}
