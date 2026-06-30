import { CharacterDetailLink } from '@/components/characters/character-detail-link'
import { CharacterThumbnailCard } from '@/components/characters/character-thumbnail-card'
import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CharacterGridCardProps {
  character: Character
  rank?: number
  className?: string
}

export function CharacterGridCard({ character, rank, className }: CharacterGridCardProps) {
  const creatorLabel = character.tag?.trim() || null

  return (
    <CharacterDetailLink
      characterId={character.id}
      className={cn('group flex w-full min-w-0 flex-col', className)}
    >
      <CharacterThumbnailCard
        imageUrl={character.profile_image_url}
        name={character.name}
        messageCount={character.message_count ?? 0}
        likeCount={character.like_count ?? 0}
        commentCount={character.comment_count ?? 0}
        aspectClassName="aspect-[3/4]"
        className="rounded-xl"
        statsSize="sm"
        interactive
      >
        {rank != null ? (
          <span className="absolute left-1.5 top-1.5 z-3 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
            {rank}
          </span>
        ) : null}
      </CharacterThumbnailCard>

      <div className="mt-1.5 min-w-0">
        <p className="line-clamp-1 text-[12px] font-semibold text-foreground">{character.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
          {character.short_intro}
        </p>
        {creatorLabel ? (
          <p className="mt-1 line-clamp-1 text-[9px] text-muted-foreground/60">{creatorLabel}</p>
        ) : null}
      </div>
    </CharacterDetailLink>
  )
}
