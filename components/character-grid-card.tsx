import { CharacterDetailLink } from '@/components/characters/character-detail-link'
import { CharacterThumbnailCard } from '@/components/characters/character-thumbnail-card'
import { formatCompactCount } from '@/lib/character-display'
import { toHomeCategoryLabel } from '@/lib/character-genres'
import { CHARACTER_CREATOR_LABEL } from '@/lib/site-config'
import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'

const MAX_VISIBLE_TAGS = 2

/** 그리드 카드에 실제로 쓰이는 캐릭터 필드만 — genres는 프로필 등 일부 소스에 없을 수 있어 optional */
export type CharacterGridCardData = Pick<
  Character,
  | 'id'
  | 'name'
  | 'short_intro'
  | 'profile_image_url'
  | 'tag'
  | 'message_count'
  | 'like_count'
  | 'comment_count'
> & {
  genres?: Character['genres']
}

function buildTagLabels(character: Pick<CharacterGridCardData, 'genres' | 'tag'>): string[] {
  const labels = new Set<string>()

  for (const genre of character.genres ?? []) {
    const trimmed = genre.trim()
    if (trimmed) labels.add(toHomeCategoryLabel(trimmed))
  }

  const tag = character.tag?.trim()
  if (tag) labels.add(toHomeCategoryLabel(tag))

  return Array.from(labels)
}

interface CharacterGridCardProps {
  character: CharacterGridCardData
  rank?: number
  className?: string
}

export function CharacterGridCard({ character, rank, className }: CharacterGridCardProps) {
  const creatorHandle = CHARACTER_CREATOR_LABEL
  const visibleTags = buildTagLabels(character).slice(0, MAX_VISIBLE_TAGS)

  return (
    <CharacterDetailLink
      characterId={character.id}
      className={cn('group flex w-full min-w-0 flex-col', className)}
    >
      <CharacterThumbnailCard
        imageUrl={character.profile_image_url}
        name={character.name}
        aspectClassName="aspect-[3/4]"
        className="rounded-xl"
        statsSize="sm"
        showStats={false}
        interactive
      >
        {rank != null ? (
          <span className="absolute left-1.5 top-1.5 z-3 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
            {rank}
          </span>
        ) : null}
      </CharacterThumbnailCard>

      <div className="mt-3 min-w-0">
        <p className="line-clamp-1 text-[16px] font-bold text-foreground">{character.name}</p>
        {character.short_intro ? (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
            &ldquo;{character.short_intro}&rdquo;
          </p>
        ) : null}
        <p className="mt-1.5 line-clamp-1 text-[14px] text-muted-foreground/70">
          {formatCompactCount(character.message_count ?? 0)} · {creatorHandle}
        </p>
        {visibleTags.length > 0 ? (
          <div className="mt-2 flex flex-nowrap items-center gap-1 overflow-hidden">
            {visibleTags.map((label) => (
              <span
                key={label}
                className="inline-flex h-5 shrink-0 items-center rounded-[4px] bg-muted px-2 text-[12px] font-medium text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </CharacterDetailLink>
  )
}
