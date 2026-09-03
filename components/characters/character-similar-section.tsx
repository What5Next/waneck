'use client'

import { CharacterGridCard } from '@/components/character-grid-card'
import { CharacterCardSkeleton } from '@/components/ui/skeleton'
import { useSimilarCharactersQuery } from '@/hooks/queries/use-similar-characters-query'

type CharacterSimilarSectionProps = {
  characterId: string
  createdBy: string | null
}

/** 유사 캐릭터 추천 섹션 — 항상 3개, 3열 그리드로 꽉 채워 표시 */
export function CharacterSimilarSection({
  characterId,
  createdBy,
}: CharacterSimilarSectionProps) {
  const {
    data: similarCharacters = [],
    isPending,
    isError,
  } = useSimilarCharactersQuery(characterId, { createdBy, limit: 3 })

  if (isError) return null
  if (!isPending && similarCharacters.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[19px] font-bold text-foreground">Similar characters</h2>
      <div className="grid grid-cols-3 gap-3">
        {isPending
          ? Array.from({ length: 3 }).map((_, index) => (
              <CharacterCardSkeleton key={index} />
            ))
          : similarCharacters.map((character) => (
              <CharacterGridCard key={character.id} character={character} />
            ))}
      </div>
    </section>
  )
}
