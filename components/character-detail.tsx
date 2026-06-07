import Link from 'next/link'

import type { Character } from '@/lib/types'
import { StartChatButton } from '@/components/start-chat-button'

export function CharacterDetail({ character }: { character: Character }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">

      {/* 히어로 영역 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden sm:aspect-[16/9]">
        <div className="flex h-full w-full items-center justify-center bg-card">
          {character.profile_image_url
            ? <img src={character.profile_image_url} alt={character.name} className="h-full w-full object-cover" />
            : <span className="text-[8rem] leading-none">{character.name[0]}</span>}
        </div>
        {/* 텍스트 가독성용 오버레이 — 라이트/다크 공통 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          ←
        </Link>
        {/* 이름·태그라인 */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-2xl font-bold text-white">{character.name}</h1>
          <p className="mt-1 text-sm text-white/80">{character.short_intro}</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-4">

        {/* 태그 */}
        {character.tag && (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">
              {character.tag}
            </span>
          </div>
        )}

        {/* 소개 */}
        <section>
          <h2 className="mb-2 text-sm font-medium text-foreground/90">소개</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {character.description}
          </p>
        </section>

      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <StartChatButton characterId={character.id} />
      </div>
    </div>
  )
}
