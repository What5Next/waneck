import { useMemo } from 'react'

import { useCharactersQuery } from '@/hooks/queries/use-characters-query'
import { getMoreFromCreator } from '@/lib/character-more-from-creator'

/** 동일 크리에이터의 다른 캐릭터 목록 (모달 moreFromCreator 섹션) */
export function useMoreFromCreator(characterId: string, createdBy: string | null) {
  const { data: allCharacters = [], isPending: isListPending } = useCharactersQuery()

  const items = useMemo(
    () => getMoreFromCreator(allCharacters, characterId, createdBy),
    [allCharacters, characterId, createdBy],
  )

  return { items, isListPending }
}
