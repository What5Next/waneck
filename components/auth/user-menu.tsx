'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { createClient } from '@/lib/supabase/browser'
import { DISCORD_URL, SAFETY_FILTER_KEY } from '@/lib/user-settings'
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
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [safetyFilterEnabled, setSafetyFilterEnabled] = useState(true)
  const [themeMounted, setThemeMounted] = useState(false)

  const profileName = getProfileName(user, displayName)
  const profileHandle = getProfileHandle(user, displayName)
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    const storedSafetyFilter = localStorage.getItem(SAFETY_FILTER_KEY)
    if (storedSafetyFilter !== null) {
      setSafetyFilterEnabled(storedSafetyFilter === 'true')
    }

    const supabase = createClient()
    async function loadProfile() {
      try {
        const { data } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle()

        if (data?.display_name) setDisplayName(data.display_name)
      } catch {
        // 프로필 조회 실패 시 메타데이터/이메일 fallback 유지
      }
    }

    void loadProfile()
  }, [user.id])

  function handleSafetyFilterChange(enabled: boolean) {
    setSafetyFilterEnabled(enabled)
    localStorage.setItem(SAFETY_FILTER_KEY, String(enabled))
  }

  function handleThemeToggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.refresh()
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
            themeMounted ? (
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
          trailing={themeMounted ? (isDark ? '다크' : '라이트') : '…'}
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
