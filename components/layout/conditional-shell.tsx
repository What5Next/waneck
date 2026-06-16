'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { SidebarProvider } from '@/components/layout/sidebar-context'

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isChatRoute = pathname.startsWith('/chat')

  return (
    <SidebarProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        {!isChatRoute ? (
          <Suspense fallback={<div className="h-14 shrink-0 border-b border-border" />}>
            <Header />
          </Suspense>
        ) : null}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex min-h-0 flex-1 justify-center overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
