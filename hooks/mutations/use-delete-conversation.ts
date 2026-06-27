import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteConversation } from '@/lib/api/conversations'
import { queryKeys } from '@/lib/api/query-keys'

export function useDeleteConversation(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.byCharacter(characterId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
    },
  })
}
