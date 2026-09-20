import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateCharacter,
  type UpdateCharacterBody,
} from '@/lib/api/characters'
import { queryKeys } from '@/lib/api/query-keys'
import type { Character, CharacterWithDetail } from '@/lib/types'

/**
 * 캐릭터 수정 — 목록·상세·내 캐릭터 목록 캐시를 응답으로 즉시 갱신한 뒤 invalidate.
 * invalidate만 하면 상세 페이지 placeholder가 refetch 전까지 구 값(예: 이미지)을
 * 잠깐 보여주기 때문에, PATCH 응답을 먼저 캐시에 반영해 이동 직후에도 최신 값이 보이게 한다.
 */
export function useUpdateCharacter(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCharacterBody) =>
      updateCharacter(characterId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData<CharacterWithDetail>(
        queryKeys.characters.detail(characterId),
        (old) => (old ? { ...old, ...updated } : old),
      )
      queryClient.setQueryData<Character[]>(queryKeys.characters.list(), (old) =>
        old?.map((c) => (c.id === characterId ? { ...c, ...updated } : c)),
      )
      queryClient.setQueryData<Character[]>(queryKeys.characters.mine(), (old) =>
        old?.map((c) => (c.id === characterId ? { ...c, ...updated } : c)),
      )

      void queryClient.invalidateQueries({
        queryKey: queryKeys.characters.all,
      })
    },
  })
}
