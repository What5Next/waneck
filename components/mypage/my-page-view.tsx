"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="px-1 text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-0.5 rounded-2xl bg-muted/15 p-1.5">
        {children}
      </div>
    </div>
  );
}

function SettingsRowButton({
  icon,
  label,
  value,
  onClick,
  trailing,
  showChevron = true,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  showChevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="shrink-0 text-muted-foreground">{icon}</div>
        <p className="text-sm font-medium text-foreground/90">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {value ? (
          <span className="max-w-[140px] truncate text-xs text-muted-foreground/60">
            {value}
          </span>
        ) : null}
        {trailing}
        {showChevron && !trailing ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
        ) : null}
      </div>
    </button>
  );
}

function SettingsRowLink({
  href,
  icon,
  label,
  value,
  external = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="shrink-0 text-muted-foreground">{icon}</div>
        <p className="text-sm font-medium text-foreground/90">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {value ? (
          <span className="max-w-[140px] truncate text-xs text-muted-foreground/60">
            {value}
          </span>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
    </Link>
  );
}

export function MyPageView() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [safetyFilterEnabled, setSafetyFilterEnabled] = useState(true);
  const [defaultModelId, setDefaultModelId] = useState<ModelId>(MODELS[0].id);
  const [themeMounted, setThemeMounted] = useState(false);

  const isDark = resolvedTheme === "dark";
  const defaultModel =
    MODELS.find((model) => model.id === defaultModelId) ?? MODELS[0];

  useEffect(() => {
    setThemeMounted(true);

    const storedSafetyFilter = localStorage.getItem(SAFETY_FILTER_KEY);
    if (storedSafetyFilter !== null) {
      setSafetyFilterEnabled(storedSafetyFilter === "true");
    }

    const storedModel = localStorage.getItem(
      DEFAULT_MODEL_KEY,
    ) as ModelId | null;
    if (storedModel && MODELS.some((model) => model.id === storedModel)) {
      setDefaultModelId(storedModel);
    }
  }, []);

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
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        <div className="h-14 shrink-0 border-b border-border" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">불러오는 중…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* 태블릿 이상 상단 헤더 */}
      <header className="sticky top-0 z-20 hidden shrink-0 border-b border-border bg-background/95 backdrop-blur-sm sm:block">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="px-1 text-base font-semibold">마이페이지</h1>
        </div>
      </header>

      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto pb-8">
        {/* 모바일 상단 */}
        <div className="flex h-12 items-center gap-2 border-b border-border px-4 sm:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">마이페이지</span>
        </div>

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
          <button
            type="button"
            className="group flex w-full items-center justify-between rounded-2xl bg-muted/15 px-4 py-3.5 transition-colors hover:bg-muted/20"
          >
            <div className="flex items-center gap-2.5">
              <Gem className="h-5 w-5 text-primary/80" aria-hidden />
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-semibold tabular-nums">0</span>
                <span className="text-xs text-muted-foreground">won</span>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          </button>

          {/* 빠른 설정 */}
          <SettingsGroup title="빠른 설정">
            <SettingsRowButton
              icon={<Bot className="h-4 w-4" />}
              label="모델 설정"
              value={defaultModel.shortName}
            />
            <SettingsRowButton
              icon={<FileText className="h-4 w-4" />}
              label="프롬프트 설정"
              value="기본 프롬프트"
            />
            <SettingsRowButton
              icon={<CircleUser className="h-4 w-4" />}
              label="페르소나 설정"
              value={profile.display_name}
            />
            <SettingsRowButton
              icon={<NotebookText className="h-4 w-4" />}
              label="유저 노트"
              value="등록된 노트 없음"
            />
          </SettingsGroup>

          {/* MY */}
          <SettingsGroup title="MY">
            <SettingsRowButton
              icon={<Heart className="h-4 w-4" />}
              label="좋아요한 캐릭터"
            />
            <div className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="shrink-0 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-foreground/90">
                  세이프티 필터
                </p>
              </div>
              <Switch
                checked={safetyFilterEnabled}
                onCheckedChange={handleSafetyFilterChange}
                aria-label="세이프티 필터"
              />
            </div>
            <SettingsRowButton
              icon={<CircleCheckBig className="h-4 w-4" />}
              label="본인 인증"
              showChevron={false}
              trailing={
                <span className="text-xs font-medium text-green-500">
                  성인 인증됨
                </span>
              }
            />
            <SettingsRowButton
              icon={<Ban className="h-4 w-4" />}
              label="차단 관리"
            />
          </SettingsGroup>

          {/* 소통 */}
          <SettingsGroup title="소통">
            <SettingsRowButton
              icon={<FileText className="h-4 w-4" />}
              label="개발 현황"
            />
            <SettingsRowButton
              icon={<LifeBuoy className="h-4 w-4" />}
              label="라이브 채팅"
            />
            {DISCORD_URL ? (
              <SettingsRowLink
                href={DISCORD_URL}
                external
                icon={<MessageCircle className="h-4 w-4" />}
                label="Discord"
              />
            ) : (
              <SettingsRowButton
                icon={<MessageCircle className="h-4 w-4" />}
                label="Discord"
              />
            )}
            <SettingsRowLink
              href={`mailto:${SUPPORT_EMAIL}`}
              icon={<Mail className="h-4 w-4" />}
              label="이메일 문의"
            />
          </SettingsGroup>

          {/* 설정 */}
          <SettingsGroup title="설정">
            <SettingsRowButton
              icon={<Settings className="h-4 w-4" />}
              label="계정"
            />
            <SettingsRowButton
              icon={<Server className="h-4 w-4" />}
              label="서버 상태"
            />
            <SettingsRowButton
              icon={<Settings className="h-4 w-4" />}
              label="테마"
              value={themeMounted ? (isDark ? "다크" : "라이트") : "…"}
              onClick={handleThemeToggle}
              showChevron={false}
            />
          </SettingsGroup>

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
