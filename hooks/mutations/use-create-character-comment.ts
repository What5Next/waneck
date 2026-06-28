import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createCharacterComment,
  type CreateCharacterCommentInput,
} from '@/lib/api/character-comments'
import { appendReply } from '@/lib/character-comments-tree'
import { patchCharacterStatsInCache } from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment, CharacterWithDetail } from '@/lib/types'

export function useCreateCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCharacterCommentInput) =>
      createCharacterComment(characterId, input),
    onSuccess: (comment, input) => {
      const isReply = Boolean(input.parentId)

      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => {
          const list = prev ?? []
          if (isReply && input.parentId) {
            const updated = appendReply(list, input.parentId, comment)
            const parentFound = updated.some(
              (item) =>
                item.id === input.parentId &&
                item.replies?.some((reply) => reply.id === comment.id),
            )
            if (!parentFound) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.characters.comments(characterId),
              })
              return prev
            }
            return updated
          }
          return [
            {
              ...comment,
              like_count: comment.like_count ?? 0,
              is_liked: comment.is_liked ?? false,
              replies: [],
            },
            ...list,
          ]
        },
      )

      const detail = queryClient.getQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
      )
      patchCharacterStatsInCache(queryClient, characterId, {
        comment_count: (detail?.comment_count ?? 0) + 1,
      })
    },
  })
}
