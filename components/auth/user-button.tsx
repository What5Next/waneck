'use client'

import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'

import { LoginModal } from '@/components/auth/login-modal'
import { UserMenu } from '@/components/auth/user-menu'
import { ThemeToggle } from '@/components/chat/theme-toggle'
import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import { PopoverMenu, PopoverMenuTrigger } from '@/components/ui/popover-menu'
import { useAuth } from '@/hooks/use-auth'

export function UserButton() {
  // P1: 개별 Supabase 구독 대신 중앙 AuthProvider 사용
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // OAuth 로그인 완료 시 열려 있던 로그인 모달 닫기
  useEffect(() => {
    if (isAuthenticated) {
      setLoginOpen(false)
    }
  }, [isAuthenticated])

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <IconButton
            onClick={() => setLoginOpen(true)}
            active={loginOpen}
            aria-label="로그인"
          >
            <LogIn className={headerIconClass} />
          </IconButton>
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
    <PopoverMenu open={menuOpen} onOpenChange={setMenuOpen} className="z-[100]">
      <PopoverMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-foreground"
          aria-haspopup="menu"
          aria-label="프로필 메뉴"
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
        <UserMenu user={user} onClose={() => setMenuOpen(false)} />
      ) : null}
    </PopoverMenu>
  )
}
