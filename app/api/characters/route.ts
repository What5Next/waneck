import { NextRequest, NextResponse } from 'next/server'

import {
  getCommentCountsByCharacterIds,
  withCommentCounts,
} from '@/lib/api/character-comment-counts'
import {
  createCharacter,
  type CreateCharacterBody,
} from '@/lib/api/character-create-server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_public', true)
    .eq('is_archived', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  const commentCounts = await getCommentCountsByCharacterIds(rows.map((row) => row.id))

  const characters = withCommentCounts(rows, commentCounts).map((character) => ({
    ...character,
    like_count: character.like_count ?? 0,
    message_count: character.message_count ?? 0,
  }))

  return NextResponse.json(characters)
}

export async function POST(req: NextRequest) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: CreateCharacterBody = await req.json()
  const result = await createCharacter(body, user.id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.character, { status: 201 })
}
