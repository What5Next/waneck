'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isChatRoute = pathname.startsWith('/chat')

  return (
    <>
      {!isChatRoute ? <Header /> : null}
      <main
        className={cn(
          'flex min-h-0 justify-center overflow-hidden',
          isChatRoute ? 'h-[100dvh]' : 'h-[calc(100dvh-56px)]',
        )}
      >
        {children}
      </main>
    </>
  )
}
