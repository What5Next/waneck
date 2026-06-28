import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCharacterComment } from '@/lib/api/character-comments'
import {
  patchCharacterEngagementInCache,
  patchCharacterStatsInCache,
} from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment, CharacterWithDetail } from '@/lib/types'

export function useDeleteCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteCharacterComment(characterId),
    onSuccess: (_data, _vars, _ctx) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.comments(characterId),
      })
      patchCharacterEngagementInCache(queryClient, characterId, { my_comment: null })
      const detail = queryClient.getQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
      )
      patchCharacterStatsInCache(queryClient, characterId, {
        comment_count: Math.max(0, (detail?.comment_count ?? 1) - 1),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.comments(characterId),
      })
    },
  })
}
