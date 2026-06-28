import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addCharacterLike, removeCharacterLike } from '@/lib/api/character-likes'
import {
  patchCharacterEngagementInCache,
  patchCharacterStatsInCache,
} from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import type { CharacterWithDetail } from '@/lib/types'

type ToggleLikeVariables = {
  characterId: string
  isLiked: boolean
}

export function useToggleCharacterLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ characterId, isLiked }: ToggleLikeVariables) => {
      if (isLiked) {
        return removeCharacterLike(characterId)
      }
      return addCharacterLike(characterId)
    },
    onMutate: async ({ characterId, isLiked }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.characters.detail(characterId),
      })

      const previousDetail = queryClient.getQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
      )

      const nextLiked = !isLiked
      const likeDelta = nextLiked ? 1 : -1

      patchCharacterEngagementInCache(queryClient, characterId, { is_liked: nextLiked })
      patchCharacterStatsInCache(queryClient, characterId, {
        like_count: Math.max(0, (previousDetail?.like_count ?? 0) + likeDelta),
      })

      return { previousDetail }
    },
    onError: (_err, { characterId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.characters.detail(characterId),
          context.previousDetail,
        )
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.characters.all })
    },
    onSettled: (_data, _err, { characterId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.detail(characterId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.characters.list() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.characters.liked() })
    },
  })
}
