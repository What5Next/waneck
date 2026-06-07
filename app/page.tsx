import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

import { CHARACTERS } from '@/lib/characters'
import { Button } from '@/components/ui/button'
import { MobileShell } from '@/components/ui/mobile-shell'
import { ThemeToggle } from '@/components/chat/theme-toggle'

export default function Home() {
  const featured = CHARACTERS[0]

  return (
    <MobileShell>
      <main className="flex min-h-screen flex-col">
        <h1 className="sr-only">Chat AI 캐릭터 홈</h1>

        <div className="flex flex-col bg-background pb-8">

          {/* 헤더 */}
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="검색 (준비 중)"
              disabled
            >
              <Search className="h-5 w-5" />
            </Button>
            <span className="text-base font-medium text-foreground">캐릭터</span>
            <Link href="/characters/create">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="캐릭터 만들기"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
          </header>

          {/* 피처드 배너 */}
          <Link
            href={`/characters/${featured.id}`}
            className="group relative mx-4 mt-5 overflow-hidden rounded-2xl"
          >
            <div className="flex aspect-[16/10] w-full items-center justify-center bg-card transition-transform duration-300 group-hover:scale-[1.02]">
              <span className="text-8xl">{featured.emoji}</span>
            </div>
            {/* 텍스트 가독성용 오버레이 — 라이트/다크 공통 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                오늘의 캐릭터
              </p>
              <p className="mt-2 text-xl font-bold text-white">{featured.name}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80">
                {featured.tagline}
              </p>
            </div>
          </Link>

          {/* 전체 캐릭터 캐러셀 */}
          <section className="mt-8">
            <h2 className="mb-4 px-4 text-sm font-medium text-muted-foreground">전체 캐릭터</h2>
            <div className="flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CHARACTERS.map((c) => (
                <Link
                  key={c.id}
                  href={`/characters/${c.id}`}
                  className="group flex w-[calc(50vw-1.5rem)] max-w-[11.5rem] shrink-0 snap-start flex-col gap-3"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card shadow-lg shadow-black/20 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/30">
                    <div className="flex aspect-[3/4] w-full items-center justify-center">
                      <span className="text-6xl transition-transform duration-300 group-hover:scale-[1.06]">
                        {c.emoji}
                      </span>
                    </div>
                  </div>
                  <div className="px-1 pb-1">
                    <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                      {c.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {c.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <footer className="mt-auto flex items-center justify-end gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <ThemeToggle />
        </footer>
      </main>
    </MobileShell>
  )
}
