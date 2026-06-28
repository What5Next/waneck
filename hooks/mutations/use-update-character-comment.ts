import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateCharacterComment } from '@/lib/api/character-comments'
import { patchCharacterEngagementInCache } from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment } from '@/lib/types'

export function useUpdateCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => updateCharacterComment(characterId, content),
    onSuccess: (comment) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => prev?.map((item) => (item.id === comment.id ? comment : item)),
      )
      patchCharacterEngagementInCache(queryClient, characterId, { my_comment: comment })
    },
  })
}
