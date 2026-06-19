import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createCharacter,
  type CreateCharacterBody,
} from '@/lib/api/characters'
import { queryKeys } from '@/lib/api/query-keys'

/**
 * 캐릭터 생성 — 목록 Query invalidate.
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateCharacterBody) => createCharacter(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.all,
      })
    },
  })
}
