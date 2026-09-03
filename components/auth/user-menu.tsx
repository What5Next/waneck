'use client'

import Link from 'next/link'
import { Gem, LogOut, Shield, User } from 'lucide-react'
import { toast } from 'sonner'

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
import {
  getProfileHandle,
  getProfileInitials,
  getProfileName,
} from '@/lib/user-profile'

type UserMenuProps = {
  user: import('@supabase/supabase-js').User
  onClose: () => void
  onEditProfile: () => void
}

export function UserMenu({ user, onClose, onEditProfile }: UserMenuProps) {
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

  function handleSafetyFilterChange(enabled: boolean) {
    if (!enabled) {
      toast.error("This feature isn't supported yet.")
      return
    }
    setSafetyFilterEnabled(enabled)
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
      {/* 프로필 헤더 — 닉네임 클릭 시 프로필 수정 모달 */}
      <button
        type="button"
        onClick={() => {
          onClose()
          onEditProfile()
        }}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
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
      </button>

      <PopoverMenuSeparator />

      {/* Nex 잔액 — 아이콘부터 Top up까지 행 전체가 충전 페이지로 이동 */}
      <div className="px-1.5 py-1">
        <Link
          href="/nex"
          onClick={onClose}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Gem className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="truncate text-[13px] font-medium text-foreground/90">
              Nex{" "}
              <span className="text-muted-foreground">
                {(profile?.token_balance ?? 0).toLocaleString("en-US")}
              </span>
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">
            Top up
          </span>
        </Link>
      </div>

      <PopoverMenuSeparator />

      <div className="p-1.5">
        <PopoverMenuLink
          href="/mypage"
          icon={<User className="h-4 w-4" />}
          label="My Page"
          onClick={onClose}
        />

        <Row
          icon={<Shield className="h-4 w-4" />}
          label="Safety filter"
          labelClassName="text-[13px]"
          interactive={false}
          showChevron={false}
          trailing={
            <Switch
              checked={safetyFilterEnabled}
              onCheckedChange={handleSafetyFilterChange}
              aria-label="Safety filter"
            />
          }
        />
      </div>

      <PopoverMenuSeparator />

      <div className="p-1.5">
        <PopoverMenuItem
          icon={<LogOut className="h-4 w-4" />}
          label="Sign out"
          labelClassName="text-white/40 transition-colors group-hover:text-white/70"
          iconClassName="text-white/40 transition-colors group-hover:text-white/70"
          className="group"
          onClick={handleSignOut}
        />
      </div>
    </PopoverMenuPanel>
  )
}
