'use client'

import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type FocusModeContextValue = {
  focusMode: boolean
  toggleFocusMode: () => void
  exitFocusMode: () => void
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null)

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [focusMode, setFocusMode] = useState(false)

  // 채팅 페이지를 벗어나면 집중 모드 해제
  useEffect(() => {
    if (!pathname.startsWith('/chat')) {
      setFocusMode(false)
    }
  }, [pathname])

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev)
  }, [])

  const exitFocusMode = useCallback(() => {
    setFocusMode(false)
  }, [])

  const value = useMemo(
    () => ({ focusMode, toggleFocusMode, exitFocusMode }),
    [focusMode, toggleFocusMode, exitFocusMode],
  )

  return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>
}

export function useFocusMode() {
  const context = useContext(FocusModeContext)
  if (!context) {
    throw new Error('useFocusMode must be used within FocusModeProvider')
  }
  return context
}
