'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Volume2, X } from 'lucide-react'

import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  '추천', '신규 랭킹', '전체 랭킹', '오늘 신작',
  '로맨스', '판타지', '시뮬레이션', 'GL', 'BL',
]

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('추천')  
  const [showNotice, setShowNotice] = useState(true)
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then(setCharacters)
      .finally(() => setLoading(false))
  }, [])

  const featured = characters[featuredIdx]

  return (
      <div className="flex h-full flex-col bg-background">
        <h1 className="sr-only">Chat AI 홈</h1>

        {/* ── 카테고리 칩 ── */}
        <nav
          aria-label="카테고리"
          className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                activeCategory === cat
                  ? 'border-transparent bg-red-500 text-white'
                  : 'border-border bg-background text-foreground hover:border-red-300',
              )}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* ── 피처드 배너 ── */}
        {loading ? (
          <div className="px-4">
            <div className="aspect-1/2 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : featured && (
          <div className="px-4">
            <Link
              href={`/characters/${featured.id}`}
              className="relative block overflow-hidden rounded-2xl"
            >
              {/* 배경 */}
              <div className="flex aspect-4/3 w-full items-center justify-end bg-linear-to-br from-card via-card to-muted pr-6 pt-4">
                {featured.profile_image_url
                  ? <img src={featured.profile_image_url} alt={featured.name} className="h-[110px] w-[110px] rounded-full object-cover opacity-90" />
                  : <span className="text-[110px] leading-none opacity-90">{featured.name[0]}</span>}
              </div>
              {/* 오버레이 */}
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
              {/* 페이지 인디케이터 */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                {featuredIdx + 1} / {characters.length}
              </div>
              {/* 우측 캐릭터 썸네일 클릭 영역 */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setFeaturedIdx((i) => (i + 1) % characters.length)
                }}
                className="absolute right-0 top-0 h-full w-1/3"
                aria-label="다음 캐릭터"
              />
              {/* 본문 */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block rounded-sm bg-red-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  캐릭터 추천
                </span>
                <h2 className="mt-2 text-lg font-bold leading-snug text-white">{featured.name}</h2>
                <p className="mt-0.5 text-xs text-white/70">{featured.short_intro}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(featured.suggestions as string[] | null)?.slice(0, 2).map((s, i) => (
                    <span key={i} className="text-[11px] text-white/50">
                      #{s.replace(/\s+/g, '').slice(0, 6)}
                    </span>
                  ))}
                  {featured.tag && <span className="text-[11px] text-white/50">#{featured.tag}</span>}
                </div>
                <button
                  type="button"
                  className="mt-3 rounded-md border border-white/40 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur-sm hover:bg-black/50"
                >
                  자세히보기
                </button>
              </div>
            </Link>
          </div>
        )}

        {/* ── 2컬럼 프로모 카드 ── */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 px-4">
          <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-[11px] leading-tight text-muted-foreground">함께 즐기면,{'\n'}더 재미있는</p>
              <p className="mt-0.5 text-sm font-bold text-red-500">파티챗</p>
            </div>
            <span className="text-3xl">💬</span>
          </div>
          <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-[11px] leading-tight text-muted-foreground">오리지널{'\n'}A-RPG</p>
              <p className="mt-0.5 text-sm font-bold text-red-500">이세계 모험</p>
            </div>
            <span className="text-3xl">⚔️</span>
          </div>
        </div>

        {/* ── 신규 혜택 배너 ── */}
        <div className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3.5 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="text-[13px] font-bold leading-snug text-foreground">
                신규 사용자에게만 드리는 대박 혜택
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                미션 완료 시{' '}
                <span className="font-semibold text-red-500">포인트 1000</span> 증정
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        {/* ── 업데이트 알림 ── */}
        {showNotice && (
          <div className="mx-4 mt-2.5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 shrink-0 text-red-500" />
              <p className="text-[13px] text-foreground">[업데이트] 내 취향 설정 기능 추가</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted"
              aria-label="닫기"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* ── 오리지널 캐릭터 섹션 ── */}
        <section className="mt-6 pb-10">
          <div className="mb-3 flex items-center justify-between px-4">
            <h2 className="text-[15px] font-bold text-foreground">요즘 트렌드</h2>
            <Link
              href="/characters"
              className="flex items-center gap-0.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              전체보기 <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-pl-4 px-4 pb-1 scrollbar-none">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex w-[130px] shrink-0 flex-col">
                    <div className="aspect-3/4 w-full animate-pulse rounded-xl bg-muted" />
                    <div className="mt-2 space-y-1.5 px-0.5">
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              : characters.map((c) => (
              <Link
                key={c.id}
                href={`/characters/${c.id}`}
                className="group flex w-[130px] shrink-0 flex-col"
              >
                {/* 커버 카드 */}
                <div className="relative overflow-hidden rounded-xl bg-card shadow-md shadow-black/10">
                  {/* ORIGINAL 배지 */}
                  <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    ORIGINAL
                  </span>
                  {/* 커버 이미지 */}
                  <div className="flex aspect-3/4 w-full items-center justify-center bg-linear-to-br from-card to-muted">
                    {c.profile_image_url
                      ? <img src={c.profile_image_url} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      : <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{c.name[0]}</span>}
                  </div>
                </div>
                {/* 카드 정보 */}
                <div className="mt-2 px-0.5">
                  <p className="line-clamp-1 text-[13px] font-semibold text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.tag} · {c.mood}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
  )
}
