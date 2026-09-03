'use client'

import type { ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      // 기존 light 사용자의 localStorage 값을 무효화해 다크 고정 기본값을 강제 적용한다
      storageKey="theme-v2"
    >
      {children}
    </NextThemesProvider>
  )
}
