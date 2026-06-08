'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Character } from '@/lib/types'

interface CharacterRowProps {
  title: string
  characters: Character[]
  loading?: boolean
  moreHref?: string
}

export function CharacterRow({ title, characters, loading = false, moreHref = '/characters' }: CharacterRowProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const el = sliderRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => { updateScrollState() }, [characters])

  function slide(dir: 'left' | 'right') {
    const el = sliderRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth : el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        <Link
          href={moreHref}
          className="flex items-center gap-0.5 text-[12px] text-muted-foreground hover:text-foreground"
        >
          전체보기 <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

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
          className="flex gap-2 overflow-x-auto scroll-smooth px-4 pb-1 scrollbar-none"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex w-[calc(50%-4px)] shrink-0 flex-col xs:w-[calc(33.333%-6px)]">
                  <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-muted" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))
            : characters.map((c) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="group flex w-[calc(50%-4px)] shrink-0 flex-col xs:w-[calc(33.333%-6px)]"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-muted">
                    {c.profile_image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.profile_image_url} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      : <div className="flex h-full w-full items-center justify-center text-3xl">{c.name[0]}</div>}
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                      1.2K
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <p className="line-clamp-1 text-[12px] font-semibold text-foreground">{c.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">{c.short_intro}</p>
                    {c.tag && (
                      <p className="mt-1 text-[9px] text-muted-foreground/60">@{c.tag}</p>
                    )}
                  </div>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  )
}
