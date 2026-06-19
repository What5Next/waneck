'use client'

import { Moon, Sun } from 'lucide-react'

import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import { useThemeReady } from '@/hooks/use-theme-ready'

export function ThemeToggle() {
  const { isReady, isDark, toggleTheme } = useThemeReady()

  return (
    <IconButton
      aria-label={isReady ? '테마 전환' : '테마'}
      disabled={!isReady}
      onClick={isReady ? toggleTheme : undefined}
    >
      {!isReady ? (
        <span className={headerIconClass} aria-hidden />
      ) : isDark ? (
        <Sun className={headerIconClass} aria-hidden />
      ) : (
        <Moon className={headerIconClass} aria-hidden />
      )}
    </IconButton>
  )
}
