import { NextResponse } from 'next/server'

import { getCommentForCharacter } from '@/lib/api/character-comment-auth'
import { getCommentLikeCount } from '@/lib/api/character-comment-likes'
import {
  getCharacterOr404,
  requireAuthenticatedUser,
} from '@/lib/api/character-stats-auth'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id: characterId, commentId } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { errorResponse } = await getCharacterOr404(characterId)
    if (errorResponse) return errorResponse

    const { errorResponse: commentError } = await getCommentForCharacter(
      commentId,
      characterId,
    )
    if (commentError) return commentError

    const { data: existing } = await supabaseAdmin
      .from('character_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (existing) {
      const likeCount = await getCommentLikeCount(commentId)
      return NextResponse.json({ is_liked: true, like_count: likeCount })
    }

    const { error } = await supabaseAdmin.from('character_comment_likes').insert({
      comment_id: commentId,
      user_id: auth.user.id,
    })

    if (error) {
      console.error('[/api/characters/[id]/comments/[commentId]/likes POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const likeCount = await getCommentLikeCount(commentId)
    return NextResponse.json({ is_liked: true, like_count: likeCount }, { status: 201 })
  } catch (err) {
    console.error('[/api/characters/[id]/comments/[commentId]/likes POST]', err)
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

    const { errorResponse: commentError } = await getCommentForCharacter(
      commentId,
      characterId,
    )
    if (commentError) return commentError

    const { data: existing } = await supabaseAdmin
      .from('character_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (!existing) {
      const likeCount = await getCommentLikeCount(commentId)
      return NextResponse.json({ is_liked: false, like_count: likeCount })
    }

    const { error } = await supabaseAdmin
      .from('character_comment_likes')
      .delete()
      .eq('id', existing.id)

    if (error) {
      console.error('[/api/characters/[id]/comments/[commentId]/likes DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const likeCount = await getCommentLikeCount(commentId)
    return NextResponse.json({ is_liked: false, like_count: likeCount })
  } catch (err) {
    console.error('[/api/characters/[id]/comments/[commentId]/likes DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
