import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase.server'

export type CharacterCommentRecord = {
  id: string
  user_id: string
  character_id: string
  parent_id: string | null
}

/** 댓글이 해당 캐릭터에 속하는지 확인 */
export async function getCommentForCharacter(commentId: string, characterId: string) {
  const { data, error } = await supabaseAdmin
    .from('character_comments')
    .select('id, user_id, character_id, parent_id')
    .eq('id', commentId)
    .eq('character_id', characterId)
    .maybeSingle()

  if (error) {
    return {
      comment: null as null,
      errorResponse: NextResponse.json({ error: error.message }, { status: 500 }),
    }
  }

  if (!data) {
    return {
      comment: null as null,
      errorResponse: NextResponse.json({ error: 'Comment not found' }, { status: 404 }),
    }
  }

  return { comment: data as CharacterCommentRecord, errorResponse: null as null }
}
