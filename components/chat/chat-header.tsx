"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Gem, Scan, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { ChatSettingsPanel } from "@/components/chat/chat-settings-panel";
import { useFocusMode } from "@/components/layout/focus-mode-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { FadeEdge } from "@/components/ui/fade-edge";
import { IconButton } from "@/components/ui/icon-button";
import { PopoverMenu, PopoverMenuTrigger } from "@/components/ui/popover-menu";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
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
  const { focusMode, toggleFocusMode } = useFocusMode();
  const { closeMobileSidebar } = useSidebar();
  const { data: profile } = useProfileQuery();

  async function handleCopyTitle() {
    const chatPath = conversationId
      ? `/chat/${characterId}/${conversationId}`
      : `/characters/${characterId}`;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${chatPath}`
        : chatPath;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied.");
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  function handleFocusMode() {
    if (!focusMode) closeMobileSidebar();
    toggleFocusMode();
  }

  function handleSearch() {
    toast.message("Chat search is coming soon.");
  }

  return (
    <FadeEdge
      bottom
      size={CHAT_HEADER_FADE_SIZE}
      fadeColor="background"
      className="sticky top-0 z-10 shrink-0 bg-background backdrop-blur-sm"
    >
      <header className="flex h-14 items-center justify-between px-5">
      {/* 좌측: 캐릭터명 + 유틸 */}
      <div className="flex min-w-0 items-center gap-0.5">
        <h1 className="min-w-0 truncate pr-1 text-[15px] font-semibold">
          <Link
            href={`/characters/${characterId}`}
            className="truncate text-foreground transition-colors hover:text-primary"
          >
            {characterName}
          </Link>
        </h1>
        <IconButton
          size="md"
          shape="square"
          aria-label="Copy chat link"
          onClick={handleCopyTitle}
        >
          <Copy className="h-4 w-4" />
        </IconButton>
        <IconButton
          size="md"
          shape="square"
          aria-label={focusMode ? "Exit focus mode" : "Focus mode"}
          onClick={handleFocusMode}
          className={cn(
            "hidden sm:flex",
            focusMode &&
              "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          <Scan className="h-4 w-4" />
        </IconButton>
      </div>

      {/* 우측: 검색 · won · 설정 */}
      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          size="md"
          shape="square"
          aria-label="Search chat"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </IconButton>

        <Link
          href="/won"
          className="flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-foreground transition-colors hover:bg-muted"
          aria-label="Top up won"
        >
          <Gem className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-medium tabular-nums">{(profile?.token_balance ?? 0).toLocaleString("ko-KR")}</span>
        </Link>

        {/* 모바일: 바텀시트 (PopoverMenu와 open 상태 분리 — click-outside 충돌 방지) */}
        <div className="sm:hidden">
          <IconButton
            size="md"
            shape="square"
            aria-label="Chat settings"
            aria-expanded={mobileSettingsOpen}
            className={
              mobileSettingsOpen
                ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                : undefined
            }
            onClick={() => setMobileSettingsOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
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
                size="md"
                shape="square"
                aria-label="Chat settings"
                className={
                  desktopSettingsOpen
                    ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                    : undefined
                }
              >
                <SlidersHorizontal className="h-4 w-4" />
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
