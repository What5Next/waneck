import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  addCharacterCommentLike,
  removeCharacterCommentLike,
} from '@/lib/api/character-comments'
import { findInTree, patchInTree } from '@/lib/character-comments-tree'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment } from '@/lib/types'

type ToggleCommentLikeVariables = {
  commentId: string
  isLiked: boolean
}

export function useToggleCharacterCommentLike(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: ToggleCommentLikeVariables) => {
      if (isLiked) {
        return removeCharacterCommentLike(characterId, commentId)
      }
      return addCharacterCommentLike(characterId, commentId)
    },
    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.characters.comments(characterId),
      })

      const previousComments = queryClient.getQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
      )

      const nextLiked = !isLiked

      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => {
          if (!prev) return prev

          const target = findInTree(prev, commentId)
          if (!target) return prev

          const likeDelta = nextLiked ? 1 : -1
          return patchInTree(prev, commentId, {
            is_liked: nextLiked,
            like_count: Math.max(0, (target.like_count ?? 0) + likeDelta),
          })
        },
      )

      return { previousComments }
    },
    onSuccess: (result, { commentId }) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => {
          if (!prev) return prev
          return patchInTree(prev, commentId, {
            is_liked: result.is_liked,
            like_count: result.like_count,
          })
        },
      )
    },
    onError: (_err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.characters.comments(characterId),
          context.previousComments,
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.comments(characterId),
      })
    },
  })
}

export type { ToggleCommentLikeVariables }
