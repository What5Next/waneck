'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronRight, Volume2, X } from 'lucide-react'

import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MobileShell } from '@/components/mobile-shell'
import { CharacterRow } from '@/components/character-row'

const CATEGORIES = [
  '추천', '신규 랭킹', '전체 랭킹', '오늘 신작',
  '로맨스', '판타지', '시뮬레이션', 'GL', 'BL',
]

export default function Home() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('추천')
  const [showNotice, setShowNotice] = useState(true)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then(setCharacters)
      .finally(() => setLoading(false))
  }, [])

  return (
    <MobileShell>
      <div className="flex h-full overflow-hidden flex-col bg-background">
        <h1 className="sr-only">와넥 홈</h1>
        
        {/* ── 카테고리 칩 ── */}
        <nav
          aria-label="카테고리"
          className="z-10 flex min-h-14 gap-2 overflow-x-auto px-4 py-3 scrollbar-none bg-background"
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
        
        <div className='h-full overflow-y-scroll'>
          {/* ── 피처드 배너 ── */}
          {loading ? (
            <div className="px-4">
              <div className="h-[220px] w-full rounded-2xl bg-muted" />
            </div>
          ) : characters.length > 0 && (() => {
            const c = characters[characters.length - 1]
            return (
              <div
                className="mx-4 h-[220px] cursor-pointer overflow-hidden rounded-2xl"
                onClick={() => router.push(`/characters/${c.id}`)}
              >
                <div
                  className="relative h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: c.profile_image_url ? `url(${c.profile_image_url})` : undefined, backgroundColor: '#1a1a2e' }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[10px]" />
                  <div className="absolute inset-0 flex gap-3 p-4">
                    {/* 좌측 텍스트 */}
                    <div className="flex h-full flex-1 flex-col justify-end gap-1.5 overflow-hidden">
                      <span className="inline-block w-fit rounded-sm bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        NEW 캐릭터
                      </span>
                      <h2 className="line-clamp-1 text-base font-bold leading-snug text-white">{c.name}</h2>
                      <p className="line-clamp-1 text-[11px] text-white/60">{c.short_intro}</p>
                      <div className="flex flex-wrap gap-1">
                        {(c.suggestions as string[] | null)?.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] text-white/40">
                            #{s.replace(/\s+/g, '').slice(0, 6)}
                          </span>
                        ))}
                        {c.tag && <span className="text-[10px] text-white/40">#{c.tag}</span>}
                      </div>
                      <button
                        type="button"
                        className="mt-1 w-fit rounded-lg border border-white/30 px-3 py-1 text-[11px] text-white hover:bg-white/10"
                      >
                        자세히보기
                      </button>
                    </div>
                    {/* 우측: 포트레이트 */}
                    <div className="relative mt-auto aspect-square h-full shrink-0">
                      {c.profile_image_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.profile_image_url} alt={c.name} className="h-full w-full rounded-xl object-cover shadow-lg" />
                        : <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/30 text-3xl">{c.name[0]}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

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
                <p className="text-[13px] font-bold leading-snug text-black">
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

          <CharacterRow title="요즘 트렌드" characters={characters} loading={loading} />
        </div>
      </div>
    </MobileShell>
  )
}
