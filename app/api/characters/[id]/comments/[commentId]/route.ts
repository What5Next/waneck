import { NextRequest, NextResponse } from 'next/server'

import { COMMENT_SELECT, mapCommentRow } from '@/lib/api/character-comment-mapper'
import {
  getCharacterOr404,
  parseCommentContent,
  requireAuthenticatedUser,
} from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'

async function getCommentForCharacter(commentId: string, characterId: string) {
  const { data, error } = await supabaseAdmin
    .from('character_comments')
    .select('id, user_id, character_id, parent_id')
    .eq('id', commentId)
    .eq('character_id', characterId)
    .maybeSingle()

  if (error) {
    return { comment: null as null, errorResponse: NextResponse.json({ error: error.message }, { status: 500 }) }
  }

  if (!data) {
    return {
      comment: null as null,
      errorResponse: NextResponse.json({ error: 'Comment not found' }, { status: 404 }),
    }
  }

  return { comment: data, errorResponse: null as null }
}

/** 삭제 대상 row 수 (top-level + cascade replies) */
async function countDeletableRows(commentId: string, characterId: string): Promise<number> {
  const { count: directCount, error: directError } = await supabaseAdmin
    .from('character_comments')
    .select('id', { count: 'exact', head: true })
    .eq('id', commentId)
    .eq('character_id', characterId)

  if (directError || !directCount) return 0

  const { count: replyCount, error: replyError } = await supabaseAdmin
    .from('character_comments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', commentId)
    .eq('character_id', characterId)

  if (replyError) return directCount
  return directCount + (replyCount ?? 0)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id: characterId, commentId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const { comment, errorResponse: commentError } = await getCommentForCharacter(
      commentId,
      characterId,
    )
    if (commentError) return commentError

    if (comment!.user_id !== auth.user.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = parseCommentContent(body)
    if (parsed instanceof NextResponse) return parsed

    const { data, error } = await supabaseAdmin
      .from('character_comments')
      .update({
        content: parsed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('character_id', characterId)
      .select(COMMENT_SELECT)
      .maybeSingle()

    if (error) {
      console.error('[/api/characters/[id]/comments/[commentId] PATCH]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    return NextResponse.json(mapCommentRow(data))
  } catch (err) {
    console.error('[/api/characters/[id]/comments/[commentId] PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id: characterId, commentId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const { comment, errorResponse: commentError } = await getCommentForCharacter(
      commentId,
      characterId,
    )
    if (commentError) return commentError

    if (comment!.user_id !== auth.user.id) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const deletedCount = await countDeletableRows(commentId, characterId)
    if (deletedCount === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('character_comments')
      .delete()
      .eq('id', commentId)
      .eq('character_id', characterId)

    if (error) {
      console.error('[/api/characters/[id]/comments/[commentId] DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ deleted_count: deletedCount })
  } catch (err) {
    console.error('[/api/characters/[id]/comments/[commentId] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
