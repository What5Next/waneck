import { useQuery } from '@tanstack/react-query'

import { getConversations } from '@/lib/api/conversations'
import { queryKeys } from '@/lib/api/query-keys'

type UseConversationsQueryOptions = {
  /** 비로그인 시 fetch 비활성 */
  enabled?: boolean
}

/**
 * 사이드바 최근 대화 목록 Query.
 * 로그인 시에만 fetch하며, 탭 포커스 시 갱신한다.
 */
export function useConversationsQuery(options: UseConversationsQueryOptions = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: getConversations,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}
