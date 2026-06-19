import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import type { CharacterIntroMessage } from '@/lib/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Character not found' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    ...data,
    creator: data.creator,
    intro_messages: (data.intro_messages ?? []) as CharacterIntroMessage[],
  })
}
