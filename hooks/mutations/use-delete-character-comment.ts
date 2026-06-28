import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCharacterComment } from '@/lib/api/character-comments'
import { removeFromTree } from '@/lib/character-comments-tree'
import { patchCharacterStatsInCache } from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment, CharacterWithDetail } from '@/lib/types'

export function useDeleteCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteCharacterComment(characterId, commentId),
    onSuccess: (result, commentId) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => (prev ? removeFromTree(prev, commentId) : prev),
      )

      const detail = queryClient.getQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
      )
      patchCharacterStatsInCache(queryClient, characterId, {
        comment_count: Math.max(0, (detail?.comment_count ?? 0) - result.deleted_count),
      })
    },
  })
}
