import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import type { CharacterIntroMessage, CharacterWithDetail } from '@/lib/types'
import { CharacterDetail } from '@/components/character-detail'
import { MobileShell } from '@/components/mobile-shell'

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await supabase
    .from('characters')
    .select(
      `
      *,
      creator:users!characters_created_by_fkey(display_name),
      intro_messages:character_intro_messages(role, content, created_at, sort_order)
    `,
    )
    .eq('id', id)
    .order('sort_order', {
      referencedTable: 'character_intro_messages',
      ascending: true,
    })
    .single()

  if (error || !data) notFound()

  const character: CharacterWithDetail = {
    ...data,
    creator: data.creator,
    intro_messages: (data.intro_messages ?? []) as CharacterIntroMessage[],
  }

  return (
    <MobileShell>
      <CharacterDetail character={character} />
    </MobileShell>
  )
}
