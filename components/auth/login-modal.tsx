'use client'

import { createClient } from '@/lib/supabase/browser'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function LoginModal({
  open,
  onOpenChange,
  redirectPath,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  redirectPath?: string
}) {
  function getCallbackUrl() {
    return redirectPath
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`
      : `${window.location.origin}/auth/callback`
  }

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getCallbackUrl() },
    })
  }

  async function signInWithApple() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: getCallbackUrl() },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-8 py-10">
        <DialogHeader>
          <span className="text-4xl">💬</span>
          <DialogTitle className="sr-only">Sign in</DialogTitle>
          <DialogDescription>A new way to stay immersed</DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={signInWithGoogle}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={signInWithApple}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.416 2.06-1.246 2.86-.856.86-1.9 1.34-3.02 1.24-.14-1.1.42-2.06 1.24-2.86.85-.86 2.02-1.32 3.02-1.24zM20.6 17.24c-.42.98-.92 1.9-1.5 2.76-.8 1.18-1.46 2-2.4 2-.9 0-1.16-.58-2.34-.58-1.18 0-1.48.58-2.36.58-.94 0-1.66-.9-2.46-2.08-1.72-2.48-3.02-6.98-1.26-10.02.88-1.5 2.44-2.46 4.14-2.48 1.16-.02 2.14.66 2.82.66.68 0 1.9-.82 3.2-.7.54.02 2.06.22 3.04 1.66-.08.05-1.82 1.06-1.8 3.16.02 2.5 2.2 3.34 2.22 3.34-.02.06-.36 1.22-1.2 2.4z" />
          </svg>
          Continue with Apple
        </button>
      </DialogContent>
    </Dialog>
  )
}
