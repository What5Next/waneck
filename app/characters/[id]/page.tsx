import { notFound } from 'next/navigation'

import { getCharacter } from '@/lib/characters'
import { CharacterDetail } from '@/components/character-detail'
import { MobileShell } from '@/components/ui/mobile-shell'

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const character = getCharacter(id)
  if (!character) notFound()

  return (
    <MobileShell>
      <CharacterDetail character={character} />
    </MobileShell>
  )
}
