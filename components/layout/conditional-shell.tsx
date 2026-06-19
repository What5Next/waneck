'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { FocusModeProvider, useFocusMode } from '@/components/layout/focus-mode-context'
import { Header } from '@/components/layout/header'
import { SidebarProvider } from '@/components/layout/sidebar-context'
import { cn } from '@/lib/utils'

function ShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isChatRoute = pathname.startsWith('/chat')
  const { focusMode } = useFocusMode()

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Suspense
        fallback={
          !focusMode ? (
            <div
              className={cn(
                'h-14 shrink-0',
                isChatRoute && 'hidden sm:block',
              )}
            />
          ) : null
        }
      >
        <Header
          className={cn(
            focusMode && 'hidden',
            !focusMode && isChatRoute && 'hidden sm:flex',
          )}
        />
      </Suspense>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!focusMode ? <AppSidebar /> : null}
        <main className="flex min-h-0 flex-1 justify-center overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export function ConditionalShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <FocusModeProvider>
        <ShellLayout>{children}</ShellLayout>
      </FocusModeProvider>
    </SidebarProvider>
  )
}
