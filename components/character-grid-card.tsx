import { CharacterDetailLink } from '@/components/characters/character-detail-link'
import { CharacterThumbnailCard } from '@/components/characters/character-thumbnail-card'
import { formatCompactCount } from '@/lib/character-display'
import { CHARACTER_CREATOR_LABEL } from '@/lib/site-config'
import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'

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

interface CharacterGridCardProps {
  character: CharacterGridCardData
  rank?: number
  className?: string
}

export function CharacterGridCard({ character, rank, className }: CharacterGridCardProps) {
  const creatorHandle = CHARACTER_CREATOR_LABEL

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
            {character.short_intro}
          </p>
        ) : null}
        <p className="mt-1.5 line-clamp-1 text-[14px] text-muted-foreground/70">
          {formatCompactCount(character.message_count ?? 0)} · {creatorHandle}
        </p>
      </div>
    </CharacterDetailLink>
  )
}
