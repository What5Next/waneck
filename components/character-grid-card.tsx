import Link from 'next/link'

import type { Character } from '@/lib/types'
import { formatCharacterChatCount } from '@/lib/character-display'
import { cn } from '@/lib/utils'

interface CharacterGridCardProps {
  character: Character
  rank?: number
  className?: string
}

export function CharacterGridCard({ character, rank, className }: CharacterGridCardProps) {
  const creatorLabel = character.tag?.trim() || null

  return (
    <Link
      href={`/characters/${character.id}`}
      className={cn('group flex flex-col', className)}
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-muted">
        {character.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.profile_image_url}
            alt={character.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
            {character.name[0]}
          </div>
        )}

        {rank != null && (
          <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
            {rank}
          </span>
        )}

        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
          {formatCharacterChatCount(character.id)}
        </span>
      </div>

      <div className="mt-1.5 min-w-0">
        <p className="line-clamp-1 text-[12px] font-semibold text-foreground">{character.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
          {character.short_intro}
        </p>
        {creatorLabel && (
          <p className="mt-1 line-clamp-1 text-[9px] text-muted-foreground/60">{creatorLabel}</p>
        )}
      </div>
    </Link>
  )
}
