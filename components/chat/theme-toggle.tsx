'use client'

import { Moon, Sun } from 'lucide-react'

import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import { useThemeReady } from '@/hooks/use-theme-ready'

export function ThemeToggle() {
  const { isReady, isDark, toggleTheme } = useThemeReady()

  if (!isReady) {
    return (
      <IconButton disabled aria-label="테마">
        <span className={headerIconClass} aria-hidden />
      </IconButton>
    )
  }

  return (
    <IconButton aria-label="테마 전환" onClick={toggleTheme}>
      {isDark ? (
        <Sun className={headerIconClass} aria-hidden />
      ) : (
        <Moon className={headerIconClass} aria-hidden />
      )}
    </IconButton>
  )
}
