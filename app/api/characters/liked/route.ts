import { NextResponse } from 'next/server'

import { enrichCharactersWithStats } from '@/lib/api/character-list-stats'
import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function GET() {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { data, error } = await supabaseAdmin
      .from('character_likes')
      .select(
        `
        created_at,
        character:characters(*)
      `,
      )
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[/api/characters/liked GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const characters = (data ?? [])
      .map((row) => {
        const character = Array.isArray(row.character) ? row.character[0] : row.character
        return character ?? null
      })
      .filter((character): character is NonNullable<typeof character> => character !== null)

    const enrichedCharacters = await enrichCharactersWithStats(characters)

    return NextResponse.json(enrichedCharacters)
  } catch (err) {
    console.error('[/api/characters/liked GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
