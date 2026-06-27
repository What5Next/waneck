'use client'

/**
 * Supabase 인증 세션 중앙 관리.
 * - onAuthStateChange 구독을 이 파일 한 곳에서만 유지한다.
 * - 로그인/로그아웃 시 사용자 전용 Query 캐시를 갱신/제거한다.
 */
import type { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { queryKeys } from '@/lib/api/query-keys'
import { createClient } from '@/lib/supabase/browser'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  /** getUser() 초기 조회 완료 전까지 true */
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 마운트 시 현재 세션 복원
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoading(false)
    })

    // 로그인/로그아웃/토큰 갱신 이벤트 구독 (앱 전체 단일 구독)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      setIsLoading(false)

      if (nextUser) {
        // 로그인 → 사용자 데이터 stale 처리 (P3/P4 hook 연결 후 자동 refetch)
        void queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.all,
        })
      } else {
        // 로그아웃 → 이전 사용자 캐시 완전 제거
        queryClient.removeQueries({ queryKey: queryKeys.profile.all })
        queryClient.removeQueries({ queryKey: queryKeys.conversations.all })
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** AuthProvider 내부 전용 — 외부에서는 hooks/use-auth 사용 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
