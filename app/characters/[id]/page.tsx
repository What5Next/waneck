import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { CharacterDetail } from '@/components/character-detail'
import { MobileShell } from '@/components/mobile-shell'

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single()

  if (!character) notFound()

  return (
    <MobileShell>
      <CharacterDetail character={character} />
    </MobileShell>
  )
}
