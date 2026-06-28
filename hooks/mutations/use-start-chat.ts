import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { createConversation } from '@/lib/api/conversations'
import { queryKeys } from '@/lib/api/query-keys'

/** 항상 새 대화를 생성하고 해당 채팅 페이지로 이동. */
export function useStartChat() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterId: string) => createConversation(characterId),
    onSuccess: (data, characterId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.byCharacter(characterId),
      })
      router.push(`/chat/${characterId}/${data.conversationId}`)
    },
  })
}
