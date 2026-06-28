'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

import { CharacterDetailMobile } from '@/components/character-detail-mobile'
import { CharacterDetailModal } from '@/components/character-detail-modal'
import { MobileShell } from '@/components/mobile-shell'
import { PageLoading } from '@/components/ui/page-loading'
import { useCharacterQuery } from '@/hooks/queries/use-character-query'
import { ApiError } from '@/lib/api/client'

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: character, isPending, error } = useCharacterQuery(id)

  if (isPending && !character) {
    return (
      <>
        <div className="sm:hidden">
          <MobileShell>
            <PageLoading />
          </MobileShell>
        </div>
        <div className="hidden sm:block">
          <PageLoading />
        </div>
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
      <div className="sm:hidden">
        <MobileShell>
          <CharacterDetailMobile character={character} />
        </MobileShell>
      </div>
      <div className="hidden sm:contents">
        <CharacterDetailModal character={character} />
      </div>
    </>
  )
}
