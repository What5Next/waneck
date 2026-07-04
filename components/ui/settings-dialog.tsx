"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
  /** 본문 영역 className */
  bodyClassName?: string;
};

/** 타이틀 + 스크롤 본문 레이아웃의 설정용 Dialog */
export function SettingsDialog({
  open,
  onOpenChange,
  title,
  children,
  className,
  bodyClassName,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className={cn(
          "flex max-h-[min(85vh,640px)] max-w-md flex-col gap-0 overflow-hidden p-0",
          className,
        )}
        aria-describedby={undefined}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3.5">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogClose className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div
          className={cn(
            "scroll-hide min-h-0 flex-1 overflow-y-auto px-4 py-4",
            bodyClassName,
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
