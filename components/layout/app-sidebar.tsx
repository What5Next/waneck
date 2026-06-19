"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Compass, Home, MessageSquare, Plus } from "lucide-react";

import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

type RecentConversation = {
  id: string;
  character_id: string;
  character_name: string;
  character_image_url: string | null;
  last_message_at: string | null;
};

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home, match: (path: string) => path === "/" },
  {
    href: "/characters",
    label: "탐색",
    icon: Compass,
    match: (path: string) =>
      path === "/characters" ||
      (path.startsWith("/characters/") &&
        !path.startsWith("/characters/create")),
  },
  {
    href: "/characters/create",
    label: "만들기",
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
  const [recentChats, setRecentChats] = useState<RecentConversation[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    // setState는 외부 시스템(Supabase/fetch) 콜백 안에서만 호출
    function applyRecentChatsForUser(isAuthenticated: boolean) {
      if (cancelled) return;

      setIsLoggedIn(isAuthenticated);
      if (!isAuthenticated) {
        setRecentChats([]);
        return;
      }

      fetch("/api/conversations")
        .then((response) => {
          if (cancelled || !response.ok) return null;
          return response.json() as Promise<RecentConversation[]>;
        })
        .then((data) => {
          if (cancelled) return;
          setRecentChats(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!cancelled) setRecentChats([]);
        });
    }

    supabase.auth
      .getUser()
      .then(({ data }) => applyRecentChatsForUser(!!data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyRecentChatsForUser(!!session?.user);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <nav
        aria-label="주요 메뉴"
        className={cn(
          "flex shrink-0 flex-col gap-0.5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground/65",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-5 flex min-h-0 flex-1 flex-col",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div
          className={cn(
            "mb-2 flex items-center",
            collapsed ? "justify-center px-0" : "gap-2 px-3",
          )}
        >
          <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {!collapsed ? (
            <span className="text-xs font-semibold text-muted-foreground">
              최근 대화
            </span>
          ) : null}
        </div>

        <div className="scroll-hide min-h-0 flex-1 overflow-y-auto">
          {!collapsed && !isLoggedIn ? (
            <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              로그인하면 최근 대화가 여기에 표시됩니다.
            </p>
          ) : !collapsed && recentChats.length === 0 ? (
            <p className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              아직 대화한 캐릭터가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {recentChats.map((chat) => {
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
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground/65",
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
                        <span className="truncate text-sm">
                          {chat.character_name}
                        </span>
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
            aria-label="사이드바 닫기"
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
