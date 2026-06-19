"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Ban,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CircleUser,
  FileText,
  Gem,
  Heart,
  LifeBuoy,
  LogOut,
  Mail,
  MessageCircle,
  NotebookText,
  Server,
  Settings,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";

import { MODELS, type ModelId } from "@/components/chat/model-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { PageLoading } from "@/components/ui/page-loading";
import { PageNavBar } from "@/components/ui/page-nav-bar";
import { List, RowPanel } from "@/components/ui/list";
import { Row, RowLink } from "@/components/ui/row";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/browser";
import {
  DEFAULT_MODEL_KEY,
  DISCORD_URL,
  SAFETY_FILTER_KEY,
  SUPPORT_EMAIL,
} from "@/lib/user-settings";
import type { ProfileSummary } from "@/lib/user-profile";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

// 클라이언트 localStorage 초기값 (SSR과 분리해 effect 없이 읽음)
function readSafetyFilterFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SAFETY_FILTER_KEY);
  return stored !== null ? stored === "true" : true;
}

function readDefaultModelFromStorage(): ModelId {
  if (typeof window === "undefined") return MODELS[0].id;
  const stored = localStorage.getItem(DEFAULT_MODEL_KEY) as ModelId | null;
  if (stored && MODELS.some((model) => model.id === stored)) {
    return stored;
  }
  return MODELS[0].id;
}

export function MyPageView() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [safetyFilterEnabled, setSafetyFilterEnabled] = useState(
    readSafetyFilterFromStorage,
  );
  const [defaultModelId] = useState<ModelId>(readDefaultModelFromStorage);

  const isDark = resolvedTheme === "dark";
  const isThemeReady = resolvedTheme !== undefined;
  const defaultModel =
    MODELS.find((model) => model.id === defaultModelId) ?? MODELS[0];

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/");
          return null;
        }
        if (!response.ok) throw new Error("profile fetch failed");
        return response.json() as Promise<ProfileSummary>;
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleSafetyFilterChange(enabled: boolean) {
    setSafetyFilterEnabled(enabled);
    localStorage.setItem(SAFETY_FILTER_KEY, String(enabled));
  }

  function handleThemeToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.replace("/");
  }

  if (loading || !profile) {
    return <PageLoading />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* 태블릿 이상 상단 헤더 */}
      <header className="sticky top-0 z-20 hidden shrink-0 border-b border-border bg-background/95 backdrop-blur-sm sm:block">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-2">
          <IconButton
            onClick={() => router.back()}
            className="hover:bg-muted/50"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <h1 className="px-1 text-base font-semibold">마이페이지</h1>
        </div>
      </header>

      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto pb-8">
        {/* 모바일 상단 */}
        <PageNavBar
          title="마이페이지"
          onBack={() => router.back()}
          titleClassName="font-semibold text-foreground"
          className="sm:hidden"
        />

        <section className="mx-auto max-w-3xl space-y-5 px-4 py-4">
          {/* 프로필 카드 → 커뮤니티 프로필 */}
          <Link
            href="/profile"
            className="flex items-center gap-3.5 rounded-2xl bg-muted/15 px-4 py-3.5 transition-colors hover:bg-muted/20"
          >
            <Avatar className="h-12 w-12">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {getProfileInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold">
                {profile.display_name}
              </h2>
              <p className="truncate text-xs text-muted-foreground/70">
                {profile.handle}
              </p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground/60">
                <span>팔로워 {profile.follower_count}</span>
                <span>팔로잉 {profile.following_count}</span>
                <span>좋아요 0</span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          </Link>

          {/* won 잔액 */}
          <RowPanel>
            <RowLink
              href="/won"
              icon={<Gem className="h-4 w-4 text-primary/80" />}
              label="won 잔액"
              value="0"
            />
          </RowPanel>

          {/* 빠른 설정 */}
          <List title="빠른 설정">
            <Row
              icon={<Bot className="h-4 w-4" />}
              label="모델 설정"
              value={defaultModel.shortName}
            />
            <Row
              icon={<FileText className="h-4 w-4" />}
              label="프롬프트 설정"
              value="기본 프롬프트"
            />
            <Row
              icon={<CircleUser className="h-4 w-4" />}
              label="페르소나 설정"
              value={profile.display_name}
            />
            <Row
              icon={<NotebookText className="h-4 w-4" />}
              label="유저 노트"
              value="등록된 노트 없음"
            />
          </List>

          {/* MY */}
          <List title="MY">
            <Row
              icon={<Heart className="h-4 w-4" />}
              label="좋아요한 캐릭터"
            />
            <Row
              icon={<Shield className="h-4 w-4" />}
              label="세이프티 필터"
              interactive={false}
              showChevron={false}
              trailing={
                <Switch
                  checked={safetyFilterEnabled}
                  onCheckedChange={handleSafetyFilterChange}
                  aria-label="세이프티 필터"
                />
              }
            />
            <Row
              icon={<CircleCheckBig className="h-4 w-4" />}
              label="본인 인증"
              showChevron={false}
              trailing={
                <span className="text-xs font-medium text-green-500">
                  성인 인증됨
                </span>
              }
            />
            <Row
              icon={<Ban className="h-4 w-4" />}
              label="차단 관리"
            />
          </List>

          {/* 소통 */}
          <List title="소통">
            <Row
              icon={<FileText className="h-4 w-4" />}
              label="개발 현황"
            />
            <Row
              icon={<LifeBuoy className="h-4 w-4" />}
              label="라이브 채팅"
            />
            {DISCORD_URL ? (
              <RowLink
                href={DISCORD_URL}
                external
                icon={<MessageCircle className="h-4 w-4" />}
                label="Discord"
              />
            ) : (
              <Row
                icon={<MessageCircle className="h-4 w-4" />}
                label="Discord"
              />
            )}
            <RowLink
              href={`mailto:${SUPPORT_EMAIL}`}
              icon={<Mail className="h-4 w-4" />}
              label="이메일 문의"
            />
          </List>

          {/* 설정 */}
          <List title="설정">
            <Row
              icon={<Settings className="h-4 w-4" />}
              label="계정"
            />
            <Row
              icon={<Server className="h-4 w-4" />}
              label="서버 상태"
            />
            <Row
              icon={<Settings className="h-4 w-4" />}
              label="테마"
              value={isThemeReady ? (isDark ? "다크" : "라이트") : "…"}
              onClick={handleThemeToggle}
              showChevron={false}
            />
          </List>

          {/* 로그아웃 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm",
                "text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
