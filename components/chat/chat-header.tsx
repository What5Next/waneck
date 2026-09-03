"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

import { ChatSettingsPanel } from "@/components/chat/chat-settings-panel";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { FadeEdge } from "@/components/ui/fade-edge";
import { IconButton } from "@/components/ui/icon-button";
import { PopoverMenu, PopoverMenuTrigger } from "@/components/ui/popover-menu";
import { cn } from "@/lib/utils";

/** chat-header 하단 fade 높이 */
const CHAT_HEADER_FADE_SIZE = 16;

interface ChatHeaderProps {
  characterId: string;
  characterName: string;
  conversationId?: string | null;
}

export function ChatHeader({
  characterId,
  characterName,
  conversationId,
}: ChatHeaderProps) {
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [desktopSettingsOpen, setDesktopSettingsOpen] = useState(false);

  return (
    <FadeEdge
      bottom
      size={CHAT_HEADER_FADE_SIZE}
      fadeColor="background"
      className="sticky top-0 z-10 shrink-0 bg-background backdrop-blur-sm"
    >
      <header className="flex h-14 items-center justify-between px-5">
      {/* 모바일: 뒤로가기 + 캐릭터명 */}
      <Link
        href={`/characters/${characterId}`}
        className="flex min-w-0 items-center gap-0.5 sm:hidden"
        aria-label={`Back to ${characterName}`}
      >
        <ChevronLeft className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
        <h1 className="min-w-0 truncate text-base font-medium text-foreground">
          {characterName}
        </h1>
      </Link>

      {/* 데스크톱: 캐릭터명 (클릭 시 상세 페이지) */}
      <Link
        href={`/characters/${characterId}`}
        className="hidden min-w-0 items-center gap-0.5 text-foreground transition-colors hover:text-foreground/70 sm:flex"
      >
        <h1 className="min-w-0 truncate text-base font-medium">
          {characterName}
        </h1>
        <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
      </Link>

      {/* 우측: 설정 */}
      <div className="flex shrink-0 items-center gap-1">
        {/* 모바일: 바텀시트 (PopoverMenu와 open 상태 분리 — click-outside 충돌 방지) */}
        <div className="sm:hidden">
          <IconButton
            size="lg"
            shape="square"
            aria-label="Chat settings"
            aria-expanded={mobileSettingsOpen}
            className={cn(
              "h-10 w-10 [&_svg]:size-6",
              mobileSettingsOpen &&
                "bg-muted text-foreground",
            )}
            onClick={() => setMobileSettingsOpen(true)}
          >
            <Menu />
          </IconButton>

          <Dialog open={mobileSettingsOpen} onOpenChange={setMobileSettingsOpen}>
            <BottomSheetContent
              open={mobileSettingsOpen}
              onDismiss={() => setMobileSettingsOpen(false)}
              aria-describedby={undefined}
            >
              <DialogTitle className="sr-only">Chat settings</DialogTitle>
              <ChatSettingsPanel
                characterId={characterId}
                characterName={characterName}
                conversationId={conversationId}
                presentation="sheet"
                onClose={() => setMobileSettingsOpen(false)}
              />
            </BottomSheetContent>
          </Dialog>
        </div>

        {/* 데스크톱: 팝오버 */}
        <div className="hidden sm:block">
          <PopoverMenu
            open={desktopSettingsOpen}
            onOpenChange={setDesktopSettingsOpen}
          >
            <PopoverMenuTrigger asChild>
              <IconButton
                size="lg"
                shape="square"
                aria-label="Chat settings"
                className={cn(
                  "h-10 w-10 [&_svg]:size-6",
                  desktopSettingsOpen &&
                    "bg-muted text-foreground",
                )}
              >
                <Menu />
              </IconButton>
            </PopoverMenuTrigger>

            {desktopSettingsOpen ? (
              <ChatSettingsPanel
                characterId={characterId}
                characterName={characterName}
                conversationId={conversationId}
                presentation="popover"
                onClose={() => setDesktopSettingsOpen(false)}
              />
            ) : null}
          </PopoverMenu>
        </div>
      </div>
      </header>
    </FadeEdge>
  );
}
