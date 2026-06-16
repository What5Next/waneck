'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Ghost } from 'lucide-react'

import type { Character } from '@/lib/types'
import { CharacterGridCard } from '@/components/character-grid-card'
import { cn } from '@/lib/utils'

interface CharacterSectionProps {
  title: string
  characters: Character[]
  loading?: boolean
  moreHref?: string
  /** 가로 스크롤 슬라이더 */
  horizontal?: boolean
  /** 순위 뱃지 표시 */
  showRank?: boolean
  /** 빈 목록 안내 문구 */
  emptyMessage?: string
  className?: string
}

const CHARACTER_CARD_WIDTH_CLASS = 'w-[calc(50%-4px)] shrink-0 xs:w-[calc(33.333%-6px)]'

function CharacterSectionEmpty({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-xl',
        className,
      )}
    >
      <Ghost className="h-8 w-8 text-muted-foreground/50" aria-hidden />
      <p className="px-3 text-center text-[12px] leading-tight text-muted-foreground">
        {message}
      </p>
    </div>
  )
}

function CharacterCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-muted" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

function HorizontalSlider({
  characters,
  loading,
  showRank,
  emptyMessage,
}: {
  characters: Character[]
  loading: boolean
  showRank: boolean
  emptyMessage: string
}) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const sliderElement = sliderRef.current
    if (!sliderElement) return

    setCanScrollLeft(sliderElement.scrollLeft > 0)
    setCanScrollRight(
      sliderElement.scrollLeft + sliderElement.clientWidth < sliderElement.scrollWidth - 1,
    )
  }

  useEffect(() => {
    updateScrollState()
  }, [characters, loading])

  function slide(direction: 'left' | 'right') {
    const sliderElement = sliderRef.current
    if (!sliderElement) return

    sliderElement.scrollBy({
      left: direction === 'left' ? -sliderElement.clientWidth : sliderElement.clientWidth,
      behavior: 'smooth',
    })
  }

  if (!loading && characters.length === 0) {
    return (
      <div className="flex justify-center px-4 pb-1">
        <CharacterSectionEmpty
          message={emptyMessage}
          className={CHARACTER_CARD_WIDTH_CLASS}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => slide('left')}
          className="absolute left-1 top-[40%] z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 shadow-md"
          aria-label="이전"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => slide('right')}
          className="absolute right-1 top-[40%] z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 shadow-md"
          aria-label="다음"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}

      <div
        ref={sliderRef}
        onScroll={updateScrollState}
        className="scroll-hide flex gap-2 overflow-x-auto scroll-smooth px-4 pb-1"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <CharacterCardSkeleton
                key={index}
                className={CHARACTER_CARD_WIDTH_CLASS}
              />
            ))
          : characters.map((character, index) => (
              <CharacterGridCard
                key={character.id}
                character={character}
                rank={showRank ? index + 1 : undefined}
                className={CHARACTER_CARD_WIDTH_CLASS}
              />
            ))}
      </div>
    </div>
  )
}

export function CharacterSection({
  title,
  characters,
  loading = false,
  moreHref,
  horizontal = false,
  showRank = false,
  emptyMessage = '표시할 캐릭터가 없습니다.',
  className,
}: CharacterSectionProps) {
  return (
    <section className={cn('mt-6', className)}>
      {title ? (
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
          {moreHref && (
            <Link
              href={moreHref}
              className="flex items-center gap-0.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              전체보기 <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      ) : null}

      {horizontal ? (
        <HorizontalSlider
          characters={characters}
          loading={loading}
          showRank={showRank}
          emptyMessage={emptyMessage}
        />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-4 xs:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CharacterCardSkeleton key={index} />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="flex justify-center px-4">
          <CharacterSectionEmpty
            message={emptyMessage}
            className={CHARACTER_CARD_WIDTH_CLASS}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-4 xs:grid-cols-3">
          {characters.map((character, index) => (
            <CharacterGridCard
              key={character.id}
              character={character}
              rank={showRank ? index + 1 : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
