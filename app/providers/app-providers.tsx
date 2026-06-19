'use client'

/**
 * 앱 전역 Provider 조합.
 * 순서: Theme → Query → Auth
 * - Query가 Auth 바깥: AuthProvider에서 useQueryClient() 사용 가능
 * - Auth가 Shell 바깥: header/sidebar/chat 전역에서 useAuth() 사용 가능
 */
import type { ReactNode } from 'react'

import { AuthProvider } from '@/app/providers/auth-provider'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/providers/theme-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
