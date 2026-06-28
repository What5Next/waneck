import { NextRequest, NextResponse } from 'next/server'

import {
  getCharacterOr404,
  parseCommentContent,
  requireAuthenticatedUser,
} from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { CharacterComment } from '@/lib/types'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

function mapCommentRow(row: {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  author: { display_name: string | null } | { display_name: string | null }[] | null
}): CharacterComment {
  const author = Array.isArray(row.author) ? row.author[0] : row.author
  return {
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.user_id,
      display_name: author?.display_name ?? null,
    },
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const limitParam = Number(req.nextUrl.searchParams.get('limit') ?? DEFAULT_LIMIT)
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(1, limitParam), MAX_LIMIT)
      : DEFAULT_LIMIT

    const { data, error } = await supabaseAdmin
      .from('character_comments')
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author:users!character_comments_user_id_fkey(display_name)
      `,
      )
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[/api/characters/[id]/comments GET]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json((data ?? []).map(mapCommentRow))
  } catch (err) {
    console.error('[/api/characters/[id]/comments GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const body = await req.json()
    const parsed = parseCommentContent(body)
    if (parsed instanceof NextResponse) return parsed

    const { data: existing } = await supabaseAdmin
      .from('character_comments')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'already_commented' }, { status: 409 })
    }

    const { data, error } = await supabaseAdmin
      .from('character_comments')
      .insert({
        character_id: characterId,
        user_id: auth.user.id,
        content: parsed,
      })
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author:users!character_comments_user_id_fkey(display_name)
      `,
      )
      .single()

    if (error || !data) {
      console.error('[/api/characters/[id]/comments POST]', error)
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create comment' },
        { status: 500 },
      )
    }

    return NextResponse.json(mapCommentRow(data), { status: 201 })
  } catch (err) {
    console.error('[/api/characters/[id]/comments POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: characterId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const body = await req.json()
    const parsed = parseCommentContent(body)
    if (parsed instanceof NextResponse) return parsed

    const { data, error } = await supabaseAdmin
      .from('character_comments')
      .update({
        content: parsed,
        updated_at: new Date().toISOString(),
      })
      .eq('character_id', characterId)
      .eq('user_id', auth.user.id)
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author:users!character_comments_user_id_fkey(display_name)
      `,
      )
      .maybeSingle()

    if (error) {
      console.error('[/api/characters/[id]/comments PATCH]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    return NextResponse.json(mapCommentRow(data))
  } catch (err) {
    console.error('[/api/characters/[id]/comments PATCH]', err)
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
      .from('character_comments')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('character_comments')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[/api/characters/[id]/comments DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[/api/characters/[id]/comments DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
