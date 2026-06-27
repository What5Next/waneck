'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

import { CharacterDetail } from '@/components/character-detail'
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
      <MobileShell>
        <PageLoading />
      </MobileShell>
    )
  }

  if (error instanceof ApiError && error.status === 404) {
    notFound()
  }

  if (error || !character) {
    notFound()
  }

  return (
    <MobileShell>
      <CharacterDetail character={character} />
    </MobileShell>
  )
}
