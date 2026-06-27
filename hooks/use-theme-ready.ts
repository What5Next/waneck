'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState, startTransition } from 'react'

/**
 * next-themes 하이드레이션 가드 + 토글 유틸.
 * mounted 전에는 서버·클라 첫 렌더를 동일하게 유지한다.
 * (resolvedTheme만으로 가드하면 next-themes 스크립트가 클라 첫 페인트에 값을 채워 mismatch 발생)
 */
export function useThemeReady() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  const isReady = mounted
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  const themeLabel =
    !mounted || resolvedTheme === undefined
      ? '…'
      : isDark
        ? '다크'
        : '라이트'

  return {
    isReady,
    isDark,
    toggleTheme,
    themeLabel,
  }
}
