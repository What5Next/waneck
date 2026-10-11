"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Gem, Home, LayoutGrid, Plus, UserPlus } from "lucide-react";

import { useLoginPrompt } from "@/components/auth/login-prompt-provider";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useAuth } from "@/hooks/use-auth";
import { useConversationsQuery } from "@/hooks/queries/use-conversations-query";
import type { RecentConversation } from "@/lib/api/conversations";
import { SIGNUP_BONUS_NEX } from "@/lib/nex-shop";
import { CHARACTER_CREATION_ENABLED } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  {
    href: "/characters",
    label: "Explore",
    icon: LayoutGrid,
    match: (path: string) =>
      path === "/characters" ||
      (path.startsWith("/characters/") &&
        !path.startsWith("/characters/create")),
  },
  {
    href: "/characters/create",
    label: "Create",
    icon: Plus,
    match: (path: string) => path.startsWith("/characters/create"),
  },
] as const;

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { requestLogin } = useLoginPrompt();
  // P4: useEffect fetch 제거 — TanStack Query 캐시 사용
  const {
    data: recentChats = [],
    isPending: isConversationsLoading,
  } = useConversationsQuery({ enabled: isAuthenticated });

  const visibleRecentChats: RecentConversation[] = isAuthenticated
    ? recentChats
    : [];

  return (
    <>
      <nav
        aria-label="Main menu"
        className={cn(
          "flex shrink-0 flex-col gap-0.5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {NAV_ITEMS.filter(
          (item) =>
            CHARACTER_CREATION_ENABLED || item.href !== "/characters/create",
        ).map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl py-2.5 text-base font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/90 hover:bg-muted/50 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" fill="currentColor" />
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 상태: Explore 아래 구분선 + 가입 유도 카드 (최근 대화 영역 대신) */}
      {!isAuthLoading && !isAuthenticated ? (
        <>
          <div
            className={cn(
              "mt-4 shrink-0 border-t border-border/40",
              collapsed ? "mx-2" : "mx-3",
            )}
          />
          {collapsed ? (
            <button
              type="button"
              onClick={() => requestLogin()}
              title={`Sign up and get ${SIGNUP_BONUS_NEX} Nex!`}
              aria-label="Sign up"
              className="mx-2 mt-4 flex shrink-0 items-center justify-center rounded-xl py-2.5 text-white/90 transition-colors hover:bg-muted/50 hover:text-white"
            >
              <Gem className="h-[18px] w-[18px]" aria-hidden />
            </button>
          ) : (
            <div className="mx-3 mt-4 shrink-0">
              {/* 메뉴 항목과 같은 틀의 가입 버튼 (왼쪽 정렬) */}
              <button
                type="button"
                onClick={() => requestLogin()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base font-medium text-white/90 transition-colors hover:bg-muted/50 hover:text-white"
              >
                <UserPlus className="h-[18px] w-[18px] shrink-0" fill="currentColor" />
                Sign up
              </button>
              {/* 가입 혜택 말풍선 — 화살표가 Sign up 버튼을 가리킨다 */}
              <div
                role="note"
                className="relative ml-3 mt-1.5 w-fit max-w-full rounded-md bg-white px-3.5 py-1 text-left text-[13px] font-medium leading-5 text-neutral-900 shadow-md"
              >
                <span
                  aria-hidden
                  className="absolute -top-1 left-4 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-white"
                />
                Sign up and get {SIGNUP_BONUS_NEX} Nex!
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* 로그아웃 상태에서는 최근 대화 영역 자체를 숨긴다 */}
      {isAuthenticated ? (
        <>
        <div className={cn("mt-4 shrink-0 border-t border-border/40", collapsed ? "mx-2" : "mx-3")} />

        <div
          className={cn(
            "mt-4 flex min-h-0 flex-1 flex-col",
            collapsed ? "px-2" : "px-3",
          )}
        >
          <div
            className={cn(
              "mb-2 flex items-center",
              collapsed ? "justify-center px-0" : "px-3",
            )}
          >
            {!collapsed ? (
              <span className="text-sm font-semibold text-white">
                Recent chats
              </span>
            ) : null}
          </div>

          <div className="scroll-hide min-h-0 flex-1 overflow-y-auto">
            {!collapsed &&
            !isConversationsLoading &&
            visibleRecentChats.length === 0 ? (
              <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                No chats yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {visibleRecentChats.map((chat) => {
                  const chatPath = `/chat/${chat.character_id}/${chat.id}`;
                  const isActive = pathname === chatPath;

                  return (
                    <li key={chat.id}>
                      <Link
                        href={chatPath}
                        onClick={onNavigate}
                        title={collapsed ? chat.character_name : undefined}
                        className={cn(
                          "flex items-center rounded-xl transition-colors",
                          collapsed
                            ? "justify-center p-1.5"
                            : "gap-2.5 px-3 py-2",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/90 hover:bg-muted/50 hover:text-white",
                        )}
                      >
                        {chat.character_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={chat.character_image_url}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {chat.character_name[0]}
                          </div>
                        )}
                        {!collapsed ? (
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {chat.character_name}
                            </p>
                            {chat.last_message_preview ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {chat.last_message_preview}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        </>
      ) : null}
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobileSidebar } = useSidebar();
  const previousPathnameRef = useRef(pathname);

  // 모바일 드로어: 라우트 이동 시에만 닫기
  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <div
        className={cn(
          "hidden h-full min-h-0 shrink-0 flex-col bg-background pt-3 transition-[width] duration-200 ease-in-out sm:flex",
          collapsed ? "w-20" : "w-[260px]",
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </div>

      {/* 모바일: 화면 왼쪽 절반만 덮는 사이드바 */}
      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-y-0 right-0 z-40 w-1/2 bg-transparent sm:hidden"
            aria-label="Close sidebar"
            onClick={closeMobileSidebar}
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex min-h-0 w-1/2 max-w-[300px] flex-col bg-background pt-3 sm:hidden",
              "animate-in slide-in-from-left duration-200",
            )}
          >
            <SidebarNav collapsed={false} onNavigate={closeMobileSidebar} />
          </div>
        </>
      ) : null}
    </>
  );
}
