import { useQuery } from '@tanstack/react-query'

import { fetchConversationSettings } from '@/lib/api/conversation-settings'
import { queryKeys } from '@/lib/api/query-keys'

type UseConversationSettingsQueryOptions = {
  enabled?: boolean
}

/** 채팅방별 설정 snapshot 조회 */
export function useConversationSettingsQuery(
  conversationId: string | null | undefined,
  options: UseConversationSettingsQueryOptions = {},
) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.conversations.settings(conversationId ?? ''),
    queryFn: () => fetchConversationSettings(conversationId ?? ''),
    enabled: enabled && Boolean(conversationId),
    staleTime: 30_000,
  })
}
