import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { createConversation } from '@/lib/api/conversations'
import { queryKeys } from '@/lib/api/query-keys'

/**
 * 대화 시작 — 기존 대화 재사용 또는 새 대화 생성.
 */
export function useStartChat() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterId: string) => createConversation(characterId),
    onSuccess: (data, characterId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      })
      router.push(`/chat/${characterId}/${data.conversationId}`)
    },
  })
}
