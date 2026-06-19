'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { LogIn } from 'lucide-react'

import { LoginModal } from '@/components/auth/login-modal'
import { UserMenu } from '@/components/auth/user-menu'
import { ThemeToggle } from '@/components/chat/theme-toggle'
import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import { PopoverMenu, PopoverMenuTrigger } from '@/components/ui/popover-menu'
import { createClient } from '@/lib/supabase/browser'

export function UserButton() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setLoginOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [])

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
