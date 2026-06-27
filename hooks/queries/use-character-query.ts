import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getCharacterDetail } from '@/lib/api/characters'
import { queryKeys } from '@/lib/api/query-keys'
import type { Character, CharacterWithDetail } from '@/lib/types'

type UseCharacterQueryOptions = {
  /** false면 fetch 안 함 */
  enabled?: boolean
}

/**
 * 캐릭터 상세 Query.
 * 상세 페이지 재방문 시 캐시를 사용하고, 목록 캐시가 있으면 placeholder로 첫 페인트를 가속한다.
 */
export function useCharacterQuery(
  characterId: string,
  options: UseCharacterQueryOptions = {},
) {
  const { enabled = true } = options
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: queryKeys.characters.detail(characterId),
    queryFn: () => getCharacterDetail(characterId),
    enabled: enabled && !!characterId,
    staleTime: 60_000,
    placeholderData: () => {
      const list = queryClient.getQueryData<Character[]>(
        queryKeys.characters.list(),
      )
      const fromList = list?.find((character) => character.id === characterId)
      if (!fromList) return undefined

      // 목록 캐시로 첫 페인트 가속 — creator/intro는 API 응답으로 보완
      return {
        ...fromList,
        creator: null,
        intro_messages: [],
      } satisfies CharacterWithDetail
    },
  })
}
