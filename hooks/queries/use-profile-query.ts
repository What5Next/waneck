import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { ApiError } from '@/lib/api/client'
import { getProfile } from '@/lib/api/profile'
import { queryKeys } from '@/lib/api/query-keys'

type UseProfileQueryOptions = {
  /** false면 fetch 안 함 (비로그인 등) */
  enabled?: boolean
}

/**
 * 로그인 사용자 프로필 Query.
 * profile / mypage / user-menu가 동일 캐시를 공유한다.
 */
export function useProfileQuery(options: UseProfileQueryOptions = {}) {
  const { enabled = true } = options
  const router = useRouter()

  const query = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: getProfile,
    enabled,
    staleTime: 30_000,
    // 프로필 실패 시 무한 재시도 방지 (401은 아래에서 리다이렉트)
    retry: false,
  })

  // 401 → 홈으로 (기존 profile-view / my-page 동작 유지)
  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      router.replace('/')
    }
  }, [query.error, router])

  return query
}
