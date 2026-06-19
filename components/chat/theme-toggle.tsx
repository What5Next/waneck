'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { startTransition, useEffect, useState } from 'react'

import {
  HeaderIconButton,
  headerIconClass,
} from '@/components/layout/header-icon-button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) {
    return (
      <HeaderIconButton disabled aria-label="테마">
        <span className={headerIconClass} aria-hidden />
      </HeaderIconButton>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <HeaderIconButton
      aria-label="테마 전환"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <Sun className={headerIconClass} aria-hidden />
      ) : (
        <Moon className={headerIconClass} aria-hidden />
      )}
    </HeaderIconButton>
  )
}
