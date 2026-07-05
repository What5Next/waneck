import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  NEW_PROMPT_TITLE,
  USER_PROMPT_SELECT,
  getNextPromptSortOrder,
} from '@/lib/api/user-default-settings-server'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(_req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const sortOrder = await getNextPromptSortOrder(auth.user.id)

    const { data, error } = await supabaseAdmin
      .from('user_prompts')
      .insert({
        user_id: auth.user.id,
        title: NEW_PROMPT_TITLE,
        content: '',
        is_default: false,
        sort_order: sortOrder,
      })
      .select(USER_PROMPT_SELECT)
      .single()

    if (error || !data) {
      console.error('[/api/user/prompts POST]', error)
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create prompt' },
        { status: 500 },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[/api/user/prompts POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
