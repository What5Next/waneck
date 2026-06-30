'use client'

import { notFound, useRouter } from 'next/navigation'
import { use } from 'react'

import { CharacterDetail } from '@/components/character-detail'
import { CharacterDetailHeaderMenu } from '@/components/characters/character-detail-header-menu'
import { CharacterDetailModal } from '@/components/character-detail-modal'
import { MobileShell } from '@/components/mobile-shell'
import { FadeEdge } from '@/components/ui/fade-edge'
import { PageLoading } from '@/components/ui/page-loading'
import { PageNavBar } from '@/components/ui/page-nav-bar'
import { useCharacterQuery } from '@/hooks/queries/use-character-query'
import { useHydrated } from '@/hooks/use-hydrated'
import { useIsDesktop } from '@/hooks/use-media-query'
import { ApiError } from '@/lib/api/client'

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const isDesktop = useIsDesktop()
  const { data: character, isPending, error } = useCharacterQuery(id)

  if (isPending && !character) {
    return (
      <>
        <div className="h-full min-h-0 w-full sm:hidden">
          <MobileShell>
            <PageLoading />
          </MobileShell>
        </div>
        {hydrated && isDesktop ? <PageLoading /> : null}
      </>
    )
  }

  if (error instanceof ApiError && error.status === 404) {
    notFound()
  }

  if (error || !character) {
    notFound()
  }

  return (
    <>
      {/* 모바일: 풀페이지 — 부모 높이 체인 필수 (main overflow-hidden 대응) */}
      <div className="h-full min-h-0 w-full sm:hidden">
        <MobileShell>
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
            <FadeEdge
              bottom
              size={16}
              fadeColor="background"
              className="z-10 shrink-0 bg-background"
            >
              <PageNavBar
                title={character.name}
                onBack={() => router.back()}
                titleClassName="truncate text-sm font-semibold text-foreground"
                className="h-10 min-h-0 border-b-0 py-0 pl-5 pr-2"
                trailing={
                  <CharacterDetailHeaderMenu
                    characterId={character.id}
                    characterName={character.name}
                  />
                }
              />
            </FadeEdge>
            <CharacterDetail character={character} />
          </div>
        </MobileShell>
      </div>

      {/* PC 직접 URL 진입 시에만 모달 — Portal이라 JS 조건부 렌더 필수 */}
      {hydrated && isDesktop ? (
        <CharacterDetailModal character={character} closeMode="route" />
      ) : null}
    </>
  )
}
