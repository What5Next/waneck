import { NextResponse } from 'next/server'

import { enrichCharactersWithStats } from '@/lib/api/character-list-stats'
import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function GET() {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { data, error } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('created_by', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[/api/characters/mine GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const characters = await enrichCharactersWithStats(data ?? [])

    return NextResponse.json(characters)
  } catch (err) {
    console.error('[/api/characters/mine GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
