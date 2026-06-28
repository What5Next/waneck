import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useCharactersQuery } from '@/hooks/queries/use-characters-query'
import { getSimilarCharacters } from '@/lib/api/characters'
import { buildSimilarExcludeKey } from '@/lib/api/similar-characters-params'
import { queryKeys } from '@/lib/api/query-keys'
import { getMoreFromCreatorExcludeIds } from '@/lib/character-more-from-creator'
import { rankSimilarCharacters } from '@/lib/character-similarity'
import type { Character, CharacterWithDetail } from '@/lib/types'

type UseSimilarCharactersQueryOptions = {
  /** false면 fetch 안 함 */
  enabled?: boolean
  limit?: number
  /** moreFromCreator exclude 계산용 */
  createdBy?: string | null
}

/**
 * 유사 캐릭터 Query.
 * 목록 캐시에서 moreFromCreator exclude를 계산하고, list 로딩 완료 후 fetch한다.
 */
export function useSimilarCharactersQuery(
  characterId: string,
  options: UseSimilarCharactersQueryOptions = {},
) {
  const { enabled = true, limit = 5, createdBy = null } = options
  const queryClient = useQueryClient()
  const { data: allCharacters = [], isPending: isListPending } = useCharactersQuery()

  const excludeIds = useMemo(
    () => getMoreFromCreatorExcludeIds(allCharacters, characterId, createdBy),
    [allCharacters, characterId, createdBy],
  )

  const excludeKey = buildSimilarExcludeKey(excludeIds)

  return useQuery({
    queryKey: queryKeys.characters.similar(characterId, excludeKey),
    queryFn: () => getSimilarCharacters(characterId, { limit, excludeIds }),
    enabled: enabled && !!characterId && !isListPending,
    staleTime: 60_000,
    placeholderData: () => {
      const list = queryClient.getQueryData<Character[]>(queryKeys.characters.list())
      if (!list?.length) return undefined

      const source =
        list.find((item) => item.id === characterId) ??
        queryClient.getQueryData<CharacterWithDetail>(
          queryKeys.characters.detail(characterId),
        )

      if (!source) return undefined

      const placeholderExcludeIds = getMoreFromCreatorExcludeIds(
        list,
        characterId,
        createdBy,
      )

      return rankSimilarCharacters(source, list, {
        limit,
        excludeIds: [characterId, ...placeholderExcludeIds],
      })
    },
  })
}
