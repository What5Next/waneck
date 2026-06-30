import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCharacterComment } from '@/lib/api/character-comments'
import { removeFromTree } from '@/lib/character-comments-tree'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment } from '@/lib/types'

export function useDeleteCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteCharacterComment(characterId, commentId),
    onSuccess: (_result, commentId) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => (prev ? removeFromTree(prev, commentId) : prev),
      )

      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.detail(characterId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.list(),
      })
    },
  })
}
