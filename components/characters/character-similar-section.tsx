'use client'

import { useSimilarCharactersQuery } from '@/hooks/queries/use-similar-characters-query'
import { CharacterSection } from '../character-section'

type CharacterSimilarSectionProps = {
  characterId: string
  createdBy: string | null
}

/** 유사 캐릭터 추천 섹션 */
export function CharacterSimilarSection({
  characterId,
  createdBy,
}: CharacterSimilarSectionProps) {
  const {
    data: similarCharacters = [],
    isPending,
    isError,
  } = useSimilarCharactersQuery(characterId, { createdBy })

  if (isError) return null
  if (!isPending && similarCharacters.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <CharacterSection
        title="Similar characters"
        characters={similarCharacters}
        loading={isPending}
        horizontal
      />
    </section>
  )
}
