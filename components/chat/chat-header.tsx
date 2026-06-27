"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Gem, Scan, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { ChatSettingsPanel } from "@/components/chat/chat-settings-panel";
import { useFocusMode } from "@/components/layout/focus-mode-context";
import { useSidebar } from "@/components/layout/sidebar-context";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      toast.success("링크를 복사했어요.");
    } catch {
      toast.error("복사에 실패했어요.");
    }
  }

  function handleFocusMode() {
    if (!focusMode) closeMobileSidebar();
    toggleFocusMode();
  }

  function handleSearch() {
    toast.message("대화 검색은 준비 중이에요.");
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
          aria-label="대화 링크 복사"
          onClick={handleCopyTitle}
        >
          <Copy className="h-4 w-4" />
        </IconButton>
        <IconButton
          size="md"
          shape="square"
          aria-label={focusMode ? "집중 모드 끄기" : "집중 모드"}
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
          aria-label="대화 검색"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </IconButton>

        <Link
          href="/won"
          className="flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-foreground transition-colors hover:bg-muted"
          aria-label="won 충전"
        >
          <Gem className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-medium tabular-nums">{(profile?.token_balance ?? 0).toLocaleString("ko-KR")}</span>
        </Link>

        <PopoverMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverMenuTrigger asChild>
            <IconButton
              size="md"
              shape="square"
              aria-label="채팅 설정"
              className={
                settingsOpen
                  ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                  : undefined
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
            </IconButton>
          </PopoverMenuTrigger>

          {settingsOpen ? (
            <ChatSettingsPanel
              characterId={characterId}
              characterName={characterName}
              conversationId={conversationId}
              onClose={() => setSettingsOpen(false)}
            />
          ) : null}
        </PopoverMenu>
      </div>
      </header>
    </FadeEdge>
  );
}
