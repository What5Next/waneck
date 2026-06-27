"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useThemeReady } from "@/hooks/use-theme-ready";
import { MODELS } from "@/components/chat/model-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { PageLoading } from "@/components/ui/page-loading";
import { PageNavBar } from "@/components/ui/page-nav-bar";
import { List, RowPanel } from "@/components/ui/list";
import { Row, RowLink } from "@/components/ui/row";
import { Switch } from "@/components/ui/switch";
import {
  DISCORD_URL,
  SUPPORT_EMAIL,
} from "@/lib/user-settings";
import { getProfileInitials } from "@/lib/user-profile";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/queries/use-profile-query";
import { useSignOut } from "@/hooks/mutations/use-sign-out";
import { useSafetyFilter, useDefaultModel } from "@/hooks/use-user-settings";

export function MyPageView() {
  const router = useRouter();
  const signOutMutation = useSignOut();
  const { themeLabel, toggleTheme } = useThemeReady();
  // P3: profile-view와 동일 Query 캐시 공유
  const { data: profile, isPending: loading } = useProfileQuery();
  // P5: localStorage 설정 — user-menu·chat-window와 실시간 동기화
  const { enabled: safetyFilterEnabled, setEnabled: setSafetyFilterEnabled } =
    useSafetyFilter();
  const { modelId: defaultModelId } = useDefaultModel();

  const defaultModel =
    MODELS.find((model) => model.id === defaultModelId) ?? MODELS[0];

  function handleSafetyFilterChange(enabled: boolean) {
    setSafetyFilterEnabled(enabled);
  }

  function handleThemeToggle() {
    toggleTheme();
  }

  async function handleSignOut() {
    await signOutMutation.mutateAsync();
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
              value={(profile.token_balance ?? 0).toLocaleString("ko-KR")}
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
              value={themeLabel}
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
