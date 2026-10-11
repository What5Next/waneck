'use client'

import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'

import { LoginModal } from '@/components/auth/login-modal'
import { UserMenu } from '@/components/auth/user-menu'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'
import { headerIconClass } from '@/components/ui/icon-button'
import { PopoverMenu, PopoverMenuTrigger } from '@/components/ui/popover-menu'
import { SIGNUP_BONUS_NEX } from '@/lib/nex-shop'
import { useAuth } from '@/hooks/use-auth'

export function UserButton() {
  // P1: 개별 Supabase 구독 대신 중앙 AuthProvider 사용
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  // OAuth 로그인 완료 시 열려 있던 로그인 모달 닫기
  useEffect(() => {
    if (isAuthenticated) {
      setLoginOpen(false)
    }
  }, [isAuthenticated])

  if (!user) {
    return (
      <>
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogIn className={headerIconClass} aria-hidden />
            Sign in
          </button>
          {/* 가입 혜택 말풍선 — 화살표가 Sign in 버튼을 가리킨다 */}
          <div
            role="note"
            className="pointer-events-none absolute right-2 top-full z-50 mt-2.5 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-lg"
          >
            <span
              aria-hidden
              className="absolute -top-1 right-8 h-3 w-3 rotate-45 rounded-[2px] bg-white"
            />
            Sign up and get {SIGNUP_BONUS_NEX} Nex!
          </div>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    )
  }

  const initials =
    (user.user_metadata?.full_name as string | undefined)
      ?.split(' ')
      .map((namePart: string) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ??
    user.email?.[0]?.toUpperCase() ??
    '?'

  return (
    <>
      <PopoverMenu open={menuOpen} onOpenChange={setMenuOpen} className="z-[100]">
        <PopoverMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-foreground"
            aria-haspopup="menu"
            aria-label="Profile menu"
          >
            {user.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.user_metadata.avatar_url as string}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </button>
        </PopoverMenuTrigger>

        {menuOpen ? (
          <UserMenu
            user={user}
            onClose={() => setMenuOpen(false)}
            onEditProfile={() => setEditProfileOpen(true)}
          />
        ) : null}
      </PopoverMenu>

      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
    </>
  )
}
