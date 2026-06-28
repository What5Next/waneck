import { NextResponse } from 'next/server'

import {
  getCharacterOr404,
  requireAuthenticatedUser,
  selfLikeForbiddenResponse,
} from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { character, errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const forbidden = selfLikeForbiddenResponse(character.created_by, auth.user.id)
    if (forbidden) return forbidden

    const { data: existing } = await supabaseAdmin
      .from('character_likes')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ is_liked: true })
    }

    const { error } = await supabaseAdmin.from('character_likes').insert({
      character_id: characterId,
      user_id: auth.user.id,
    })

    if (error) {
      console.error('[/api/characters/[id]/likes POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ is_liked: true }, { status: 201 })
  } catch (err) {
    console.error('[/api/characters/[id]/likes POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const { data: existing } = await supabaseAdmin
      .from('character_likes')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (!existing) {
      return new NextResponse(null, { status: 204 })
    }

    const { error } = await supabaseAdmin
      .from('character_likes')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[/api/characters/[id]/likes DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ is_liked: false })
  } catch (err) {
    console.error('[/api/characters/[id]/likes DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
