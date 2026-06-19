'use client'

/**
 * TanStack Query 전역 Provider.
 * - 앱 전체에서 하나의 QueryClient를 공유한다.
 * - Next.js App Router에서는 요청마다 인스턴스를 새로 만들지 않도록 useState로 보관한다.
 */
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { ApiError } from '@/lib/api/client'

const defaultQueryOptions: DefaultOptions['queries'] = {
  // 30초간 fresh — 홈↔탐색 등 짧은 네비게이션에서 중복 fetch 방지
  // P2~P4 hook에서 도메인별로 override 예정 (characters 60s 등)
  staleTime: 30_000,
  retry: (failureCount, error) => {
    // 인증 실패는 재시도해도 결과 동일 → 불필요한 요청 방지
    if (error instanceof ApiError && error.status === 401) {
      return false
    }
    return failureCount < 1
  },
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: defaultQueryOptions,
    },
  })
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // SSR/CSR 하이드레이션 간 QueryClient 인스턴스 안정화
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
