import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateCharacterComment } from '@/lib/api/character-comments'
import { updateInTree } from '@/lib/character-comments-tree'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterComment } from '@/lib/types'

type UpdateCharacterCommentInput = {
  commentId: string
  content: string
}

export function useUpdateCharacterComment(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }: UpdateCharacterCommentInput) =>
      updateCharacterComment(characterId, commentId, content),
    onSuccess: (comment) => {
      queryClient.setQueryData<CharacterComment[]>(
        queryKeys.characters.comments(characterId),
        (prev) => (prev ? updateInTree(prev, comment.id, comment) : prev),
      )
    },
  })
}

export type { UpdateCharacterCommentInput }
