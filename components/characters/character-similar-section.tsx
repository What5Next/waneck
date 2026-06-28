'use client'

import { CharacterGridCard } from '@/components/character-grid-card'
import {
  CharacterRecommendRow,
  CharacterRecommendRowSkeleton,
} from '@/components/characters/character-recommend-row'
import { useSimilarCharactersQuery } from '@/hooks/queries/use-similar-characters-query'
import { CharacterCardSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CharacterSimilarSectionProps = {
  characterId: string
  createdBy: string | null
  /** desktop sidebar: list / mobile: horizontal scroll */
  layout?: 'list' | 'horizontal'
  className?: string
}

const HORIZONTAL_CARD_CLASS = 'w-[120px] shrink-0'

/** 유사 캐릭터 추천 섹션 (모달 · 모바일 공용) */
export function CharacterSimilarSection({
  characterId,
  createdBy,
  layout = 'list',
  className,
}: CharacterSimilarSectionProps) {
  const {
    data: similarCharacters = [],
    isPending,
    isError,
  } = useSimilarCharactersQuery(characterId, { createdBy })

  if (isError) return null
  if (!isPending && similarCharacters.length === 0) return null

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <h2 className="text-sm font-semibold text-foreground">Similar characters</h2>

      {layout === 'horizontal' ? (
        <div className="scroll-hide -mx-[20px] flex gap-2 overflow-x-auto px-[20px] pb-1">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <CharacterCardSkeleton
                  key={index}
                  className={HORIZONTAL_CARD_CLASS}
                />
              ))
            : similarCharacters.map((character) => (
                <CharacterGridCard
                  key={character.id}
                  character={character}
                  className={HORIZONTAL_CARD_CLASS}
                />
              ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {isPending
            ? Array.from({ length: 3 }, (_, index) => (
                <CharacterRecommendRowSkeleton key={index} />
              ))
            : similarCharacters.map((character) => (
                <CharacterRecommendRow
                  key={character.id}
                  characterId={character.id}
                  name={character.name}
                  profileImageUrl={character.profile_image_url}
                />
              ))}
        </div>
      )}
    </section>
  )
}
