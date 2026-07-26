'use client'

import { notFound, useRouter } from 'next/navigation'
import { use, useEffect } from 'react'

import { CharacterCreateForm } from '@/components/character-create-form'
import { MobileShell } from '@/components/mobile-shell'
import { PageLoading } from '@/components/ui/page-loading'
import { useCharacterQuery } from '@/hooks/queries/use-character-query'
import { useProfileQuery } from '@/hooks/queries/use-profile-query'
import { ApiError } from '@/lib/api/client'

export default function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: character, isPending, error } = useCharacterQuery(id)
  const { data: profile, isPending: profilePending } = useProfileQuery()

  const isOwner = !!profile && !!character && character.created_by === profile.id

  useEffect(() => {
    if (!isPending && !profilePending && character && profile && !isOwner) {
      router.replace(`/characters/${id}`)
    }
  }, [isPending, profilePending, character, profile, isOwner, router, id])

  if (error instanceof ApiError && error.status === 404) {
    notFound()
  }

  if (isPending || profilePending || !character || !profile || !isOwner) {
    return (
      <MobileShell>
        <PageLoading />
      </MobileShell>
    )
  }

  return (
    <MobileShell>
      <CharacterCreateForm mode="edit" characterId={id} initialData={character} />
    </MobileShell>
  )
}
