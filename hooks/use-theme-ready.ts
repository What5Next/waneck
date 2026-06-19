'use client'

import { useTheme } from 'next-themes'
import { useCallback } from 'react'

/**
 * next-themes 하이드레이션 가드 + 토글 유틸.
 * resolvedTheme이 undefined인 동안은 라벨/아이콘을 플레이스홀더로 표시한다.
 */
export function useThemeReady() {
  const { resolvedTheme, setTheme } = useTheme()

  const isReady = resolvedTheme !== undefined
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  const themeLabel = isReady ? (isDark ? '다크' : '라이트') : '…'

  return {
    isReady,
    isDark,
    toggleTheme,
    themeLabel,
  }
}
