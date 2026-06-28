import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCharacterComment } from '@/lib/api/character-comments'
import {
  patchCharacterEngagementInCache,
  patchCharacterStatsInCache,
} from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment, CharacterWithDetail } from '@/lib/types'

export function useCreateCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createCharacterComment(characterId, content),
    onSuccess: (comment) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => [comment, ...(prev ?? [])],
      )
      patchCharacterEngagementInCache(queryClient, characterId, { my_comment: comment })
      const detail = queryClient.getQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
      )
      patchCharacterStatsInCache(queryClient, characterId, {
        comment_count: (detail?.comment_count ?? 0) + 1,
      })
    },
  })
}
