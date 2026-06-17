'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import {
  ChevronRight,
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
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/browser'
import { DISCORD_URL, SAFETY_FILTER_KEY } from '@/lib/user-settings'
import {
  getProfileHandle,
  getProfileInitials,
  getProfileName,
} from '@/lib/user-profile'
import { cn } from '@/lib/utils'

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

  // DB 프로필 이름 + 로컬 세이프티 필터 설정 로드
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
    <div className="absolute right-0 top-11 z-[100] w-[280px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      {/* 프로필 헤더 */}
      <Link
        href="/profile"
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
      >
        <Avatar className="h-10 w-10">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-sm font-semibold">
            {getProfileInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{profileName}</p>
          <p className="truncate text-xs text-muted-foreground">{profileHandle}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>

      {/* 오브 잔액 */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Gem className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-medium text-foreground">0 Orb</span>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          onClick={onClose}
        >
          충전
        </button>
      </div>

      <div className="border-t border-border" />

      <MenuRow
        as="a"
        href="/mypage"
        icon={<LayoutGrid className="h-4 w-4" />}
        label="마이페이지"
        onClick={onClose}
      />

      {/* 설정 */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm text-foreground">세이프티 필터</span>
        <Switch
          checked={safetyFilterEnabled}
          onCheckedChange={handleSafetyFilterChange}
          aria-label="세이프티 필터"
        />
      </div>
      <MenuRow
        icon={
          themeMounted ? (
            isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        }
        label="테마"
        trailing={
          <span className="text-sm text-muted-foreground">
            {themeMounted ? (isDark ? '다크' : '라이트') : '…'}
          </span>
        }
        onClick={handleThemeToggle}
        showChevron={false}
      />

      <div className="border-t border-border" />

      {/* 링크 */}
      {DISCORD_URL ? (
        <MenuRow
          as="a"
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          icon={<MessageCircle className="h-4 w-4" />}
          label="Discord"
          onClick={onClose}
        />
      ) : (
        <MenuRow
          icon={<MessageCircle className="h-4 w-4" />}
          label="Discord"
          onClick={onClose}
        />
      )}

      <div className="border-t border-border" />

      {/* 로그아웃 */}
      <button
        type="button"
        onClick={handleSignOut}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
      >
        <LogOut className="h-4 w-4 text-muted-foreground" />
        로그아웃
      </button>
    </div>
  )
}

type MenuRowProps = {
  icon: ReactNode
  label: string
  trailing?: ReactNode
  onClick?: () => void
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  showChevron?: boolean
}

function MenuRow({
  icon,
  label,
  trailing,
  onClick,
  as = 'button',
  href,
  target,
  rel,
  showChevron = true,
}: MenuRowProps) {
  const className = cn(
    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/60',
  )

  if (as === 'a' && href) {
    return (
      <Link href={href} target={target} rel={rel} className={className} onClick={onClick}>
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1">{label}</span>
        {trailing}
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {trailing}
      {showChevron && !trailing ? (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      ) : null}
    </button>
  )
}
