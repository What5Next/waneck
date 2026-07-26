import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateCharacter,
  type UpdateCharacterBody,
} from '@/lib/api/characters'
import { queryKeys } from '@/lib/api/query-keys'

/**
 * 캐릭터 수정 — 목록·상세·내 캐릭터 목록 Query invalidate.
 */
export function useUpdateCharacter(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCharacterBody) =>
      updateCharacter(characterId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.all,
      })
    },
  })
}
