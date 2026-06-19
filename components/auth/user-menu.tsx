'use client'

import Link from 'next/link'
import {
  Gem,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  PopoverMenuItem,
  PopoverMenuLink,
  PopoverMenuPanel,
  PopoverMenuSeparator,
} from '@/components/ui/popover-menu'
import { Row } from '@/components/ui/row'
import { Switch } from '@/components/ui/switch'
import { useProfileQuery } from '@/hooks/queries/use-profile-query'
import { useSignOut } from '@/hooks/mutations/use-sign-out'
import { useSafetyFilter } from '@/hooks/use-user-settings'
import { DISCORD_URL } from '@/lib/user-settings'
import {
  getProfileHandle,
  getProfileInitials,
  getProfileName,
} from '@/lib/user-profile'

type UserMenuProps = {
  user: import('@supabase/supabase-js').User
  onClose: () => void
}

export function UserMenu({ user, onClose }: UserMenuProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const signOutMutation = useSignOut()
  // P5: mypage와 실시간 동기화
  const { enabled: safetyFilterEnabled, setEnabled: setSafetyFilterEnabled } =
    useSafetyFilter()

  // P3: Supabase 직접 조회 제거 — /api/profile 캐시와 공유
  const { data: profile } = useProfileQuery({ enabled: !!user })

  const profileName =
    profile?.display_name ?? getProfileName(user, null)
  const profileHandle =
    profile?.handle ?? getProfileHandle(user, profile?.display_name)
  const avatarUrl =
    profile?.avatar_url ??
    (user.user_metadata?.avatar_url as string | undefined)
  const isDark = resolvedTheme === 'dark'
  const isThemeReady = resolvedTheme !== undefined

  function handleSafetyFilterChange(enabled: boolean) {
    setSafetyFilterEnabled(enabled)
  }

  function handleThemeToggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  async function handleSignOut() {
    try {
      await signOutMutation.mutateAsync()
      onClose()
    } catch {
      // signOut 실패 시 메뉴만 닫음
      onClose()
    }
  }

  return (
    <PopoverMenuPanel
      side="bottom"
      align="end"
      width="lg"
      padded={false}
      className="z-[100]"
    >
      {/* 프로필 헤더 */}
      <Link
        href="/profile"
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
      >
        <Avatar className="h-10 w-10">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-sm font-semibold">
            {getProfileInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {profileName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{profileHandle}</p>
        </div>
      </Link>

      <PopoverMenuSeparator />

      {/* won 잔액 */}
      <div className="px-1.5 py-1">
        <Row
          icon={<Gem className="h-4 w-4 text-primary" aria-hidden />}
          label="won"
          value="0"
          interactive={false}
          showChevron={false}
          trailing={
            <Link
              href="/won"
              onClick={onClose}
              className="text-sm font-medium text-primary hover:underline"
            >
              충전
            </Link>
          }
        />
      </div>

      <PopoverMenuSeparator />

      <div className="p-1.5">
        <PopoverMenuLink
          href="/mypage"
          icon={<LayoutGrid className="h-4 w-4" />}
          label="마이페이지"
          onClick={onClose}
        />

        <Row
          icon={<ShieldCheck className="h-4 w-4" />}
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

        <PopoverMenuItem
          icon={
            isThemeReady ? (
              isDark ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            ) : (
              <Moon className="h-4 w-4" />
            )
          }
          label="테마"
          trailing={isThemeReady ? (isDark ? '다크' : '라이트') : '…'}
          onClick={handleThemeToggle}
        />
      </div>

      <PopoverMenuSeparator />

      <div className="p-1.5">
        {DISCORD_URL ? (
          <PopoverMenuLink
            href={DISCORD_URL}
            external
            icon={<MessageCircle className="h-4 w-4" />}
            label="Discord"
            onClick={onClose}
          />
        ) : (
          <PopoverMenuItem
            icon={<MessageCircle className="h-4 w-4" />}
            label="Discord"
            onClick={onClose}
          />
        )}

        <PopoverMenuItem
          icon={<LogOut className="h-4 w-4" />}
          label="로그아웃"
          onClick={handleSignOut}
        />
      </div>
    </PopoverMenuPanel>
  )
}
