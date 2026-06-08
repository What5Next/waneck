'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'
import { LoginModal } from '@/components/auth/login-modal'

export function UserButton() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setLoginOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.refresh()
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="flex h-9 items-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          로그인
        </button>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    )
  }

  const initials = (user.user_metadata?.full_name as string | undefined)
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-foreground"
      >
        {user.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="avatar" className="h-full w-full object-cover" />
          : initials}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-border bg-card p-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-foreground">{user.user_metadata?.full_name ?? '사용자'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={signOut}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}
