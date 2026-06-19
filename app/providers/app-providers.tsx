'use client'

/**
 * 앱 전역 Provider 조합 (P0).
 * P1에서 AuthProvider가 이 트리에 추가된다.
 */
import type { ReactNode } from 'react'

import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  )
}
