'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

import { CharacterDetail } from '@/components/character-detail'
import { CharacterDetailModal } from '@/components/character-detail-modal'
import { MobileShell } from '@/components/mobile-shell'
import { PageLoading } from '@/components/ui/page-loading'
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
  const hydrated = useHydrated()
  const isDesktop = useIsDesktop()
  const { data: character, isPending, error } = useCharacterQuery(id)

  if (isPending && !character) {
    return (
      <>
        <div className="sm:hidden">
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
      {/* 모바일: 풀페이지 — CSS로 PC에서 숨김 */}
      <div className="sm:hidden">
        <MobileShell>
          <CharacterDetail character={character} />
        </MobileShell>
      </div>

      {/* PC 직접 URL 진입 시에만 모달 — Portal이라 JS 조건부 렌더 필수 */}
      {hydrated && isDesktop ? (
        <CharacterDetailModal character={character} closeMode="route" />
      ) : null}
    </>
  )
}
