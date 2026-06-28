import {
  Hash,
  Heart,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react'

import { CharacterDetailLink } from '@/components/characters/character-detail-link'
import type { Character } from '@/lib/types'
import {
  formatCompactCount,
  getCharacterImageCountValue,
} from '@/lib/character-display'
import { cn } from '@/lib/utils'

const MAX_VISIBLE_TAGS = 2

interface CharacterListCardProps {
  character: Character
  className?: string
}

function buildTagLabels(character: Character): string[] {
  const labels = new Set<string>()

  for (const genre of character.genres ?? []) {
    const trimmed = genre.trim()
    if (trimmed) labels.add(trimmed)
  }

  const tag = character.tag?.trim()
  if (tag) labels.add(tag)

  return Array.from(labels)
}

export function CharacterListCard({ character, className }: CharacterListCardProps) {
  const creatorHandle = character.tag?.trim()
  const tagLabels = buildTagLabels(character)
  const visibleTags = tagLabels.slice(0, MAX_VISIBLE_TAGS)
  const hiddenTagCount = Math.max(0, tagLabels.length - MAX_VISIBLE_TAGS)
  const likeCount = character.like_count ?? 0
  const imageCount = getCharacterImageCountValue(character.id)

  return (
    <CharacterDetailLink
      characterId={character.id}
      className={cn(
        'group flex w-full min-w-0 cursor-pointer gap-4 overflow-hidden',
        className,
      )}
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-36 sm:w-36">
        {character.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.profile_image_url}
            alt={character.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
            {character.name[0]}
          </div>
        )}
      </div>

      <div className="mr-2 flex min-w-0 flex-1 flex-col justify-between py-2">
        <div>
          <h3 className="truncate text-base font-bold text-foreground sm:text-lg">
            {character.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {character.short_intro}
          </p>
        </div>

        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="size-3" aria-hidden />
              <span>{formatCompactCount(character.message_count ?? 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="size-3" aria-hidden />
              <span>{formatCompactCount(likeCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="size-3" aria-hidden />
              <span>{imageCount}</span>
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
            {creatorHandle && (
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <span>@{creatorHandle}</span>
              </div>
            )}

            {visibleTags.length > 0 && (
              <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                {visibleTags.map((label) => (
                  <span
                    key={label}
                    className="inline-flex h-5 shrink-0 items-center rounded-full border px-1.5 text-[0.65rem] font-semibold text-foreground"
                  >
                    <Hash className="mr-0.5 size-2" aria-hidden />
                    {label}
                  </span>
                ))}
                {hiddenTagCount > 0 && (
                  <span className="inline-flex h-5 shrink-0 items-center rounded-full border px-1.5 text-[0.65rem] text-muted-foreground">
                    +{hiddenTagCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </CharacterDetailLink>
  )
}
