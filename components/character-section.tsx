'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Character } from '@/lib/types'
import { CharacterGridCard } from '@/components/character-grid-card'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { SectionHeader } from '@/components/ui/section-header'
import { CharacterCardSkeleton } from '@/components/ui/skeleton'
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

const CHARACTER_CARD_WIDTH_CLASS =
  'w-[calc(50%-4px)] shrink-0 xs:w-[calc(33.333%-5.333px)] sm:w-[calc(25%-6px)] lg:w-[calc(20%-6.4px)]'

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
      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-1">
        <EmptyState
          message={emptyMessage}
          className={cn('aspect-3/4 rounded-xl', CHARACTER_CARD_WIDTH_CLASS)}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* content-edge 래퍼: 카드는 overflow-hidden으로 안쪽에서 정확히 잘림 */}
      <div className="relative mx-4 sm:mx-6 lg:mx-8">
        {/* 카드 이미지(aspect-[3/4])와 동일한 너비·비율의 투명 sizer — 화살표를 "사진 영역" 세로 중앙에 정확히 맞추기 위함.
            화면 폭이 좁을 때 화살표가 콘텐츠 밖으로 잘리는 문제가 있어 카드 이미지 안쪽(우측 상단 겹침)으로 배치 */}
        {canScrollLeft && (
          <div
            className={cn('pointer-events-none absolute left-0 top-0 z-10 aspect-[3/4]', CHARACTER_CARD_WIDTH_CLASS)}
            aria-hidden
          >
            <IconButton
              type="button"
              variant="floating"
              size="sm"
              onClick={() => slide('left')}
              className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 bg-white/25 text-black hover:bg-white/40"
              aria-label="Previous"
            >
              <ChevronLeft />
            </IconButton>
          </div>
        )}

        {canScrollRight && (
          <div
            className={cn('pointer-events-none absolute right-0 top-0 z-10 aspect-[3/4]', CHARACTER_CARD_WIDTH_CLASS)}
            aria-hidden
          >
            <IconButton
              type="button"
              variant="floating"
              size="sm"
              onClick={() => slide('right')}
              className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 bg-white/25 text-black hover:bg-white/40"
              aria-label="Next"
            >
              <ChevronRight />
            </IconButton>
          </div>
        )}

        <div className="overflow-hidden">
          <div
            ref={sliderRef}
            onScroll={updateScrollState}
            className="scroll-hide flex gap-2 overflow-x-auto scroll-smooth pb-1"
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
  emptyMessage = 'No characters to show.',
  className,
}: CharacterSectionProps) {
  return (
    <section className={cn('mt-6', className)}>
      {title ? (
        <SectionHeader title={title} moreHref={moreHref} />
      ) : null}

      {horizontal ? (
        <HorizontalSlider
          characters={characters}
          loading={loading}
          showRank={showRank}
          emptyMessage={emptyMessage}
        />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-10 px-4 xs:grid-cols-3 sm:px-6 sm:grid-cols-4 lg:px-8 lg:grid-cols-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <CharacterCardSkeleton key={index} />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
          <EmptyState
            message={emptyMessage}
            className={cn('aspect-3/4 rounded-xl', CHARACTER_CARD_WIDTH_CLASS)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-10 px-4 xs:grid-cols-3 sm:px-6 sm:grid-cols-4 lg:px-8 lg:grid-cols-5">
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
