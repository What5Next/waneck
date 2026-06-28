import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { CharacterComment, CharacterIntroMessage } from '@/lib/types'

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

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  let isLiked = false
  let myComment: CharacterComment | null = null

  if (user) {
    const [{ data: likeRow }, { data: commentRow }] = await Promise.all([
      supabaseAdmin
        .from('character_likes')
        .select('id')
        .eq('character_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabaseAdmin
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
        .eq('character_id', id)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    isLiked = !!likeRow
    myComment = commentRow ? mapCommentRow(commentRow) : null
  }

  return NextResponse.json({
    ...data,
    like_count: data.like_count ?? 0,
    comment_count: data.comment_count ?? 0,
    message_count: data.message_count ?? 0,
    creator: data.creator,
    intro_messages: (data.intro_messages ?? []) as CharacterIntroMessage[],
    is_liked: isLiked,
    my_comment: myComment,
  })
}
