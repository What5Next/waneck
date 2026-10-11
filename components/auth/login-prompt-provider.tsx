'use client'

/**
 * 로그아웃 상태에서 로그인 전용 기능을 눌렀을 때 띄우는 전역 로그인 팝업.
 * 어디서든 `const { requestLogin } = useLoginPrompt()` 후
 * `requestLogin({ redirectPath })` 로 호출한다. 로그인에 성공하면 자동으로 닫힌다.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'

type LoginPromptOptions = {
  /** 로그인 후 돌아올 경로 (기본: 현재 페이지) */
  redirectPath?: string
}

type LoginPromptContextValue = {
  requestLogin: (options?: LoginPromptOptions) => void
}

const LoginPromptContext = createContext<LoginPromptContextValue | null>(null)

export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | undefined>()

  const requestLogin = useCallback((options?: LoginPromptOptions) => {
    setRedirectPath(
      options?.redirectPath ??
        `${window.location.pathname}${window.location.search}`,
    )
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ requestLogin }), [requestLogin])

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
      <LoginModal
        open={open && !isAuthenticated}
        onOpenChange={setOpen}
        redirectPath={redirectPath}
        description="Sign in to use this feature"
      />
    </LoginPromptContext.Provider>
  )
}

export function useLoginPrompt(): LoginPromptContextValue {
  const ctx = useContext(LoginPromptContext)
  if (!ctx) throw new Error('useLoginPrompt must be used within LoginPromptProvider')
  return ctx
}
