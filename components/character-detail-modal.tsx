"use client";

import { useRouter } from "next/navigation";

import { CharacterDetail } from "@/components/character-detail";
import { CharacterDetailHeaderMenu } from "@/components/characters/character-detail-header-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeEdge } from "@/components/ui/fade-edge";
import type { CharacterWithDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharacterDetailModalProps = {
  character: CharacterWithDetail;
  /** overlay: URL 변경 없이 닫기, route: router.back/push (직접 URL 진입) */
  closeMode?: "overlay" | "route";
  onClose?: () => void;
};

export function CharacterDetailModal({
  character,
  closeMode = "route",
  onClose,
}: CharacterDetailModalProps) {
  const router = useRouter();

  const handleClose = () => {
    if (closeMode === "overlay") {
      onClose?.();
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/characters");
  };

  const handleStartChat = () => {
    // 오버레이 모달만 명시적으로 닫음 (route 모드는 채팅 페이지 이동 시 자동 언마운트)
    if (closeMode === "overlay") {
      onClose?.();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showClose={false}
        className={cn(
          "left-1/2 top-1/2 flex h-[min(90dvh,820px)] w-[min(480px,95vw)] max-w-none -translate-x-1/2 -translate-y-1/2",
          "flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        )}
      >
        <DialogTitle className="sr-only">{character.name}</DialogTitle>
        <DialogDescription className="sr-only">
          {character.short_intro?.trim() || character.name}
        </DialogDescription>
        <FadeEdge
          bottom
          size={16}
          fadeColor="background"
          className="z-10 shrink-0 bg-background"
        >
          <header className="flex h-10 items-center pl-5 pr-1.5">
            <h2 className="min-w-0 flex-1 truncate pr-2 text-sm font-bold text-foreground">
              {character.name}
            </h2>
            <CharacterDetailHeaderMenu
              characterId={character.id}
              characterName={character.name}
            />
          </header>
        </FadeEdge>
        <CharacterDetail
          character={character}
          onBeforeNavigate={handleStartChat}
        />
      </DialogContent>
    </Dialog>
  );
}
