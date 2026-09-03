import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  USER_PERSONA_SELECT,
  parsePersonaPatch,
} from '@/lib/api/user-default-settings-server'
import { getProfileName } from '@/lib/user-profile'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const rawBody = await req.text()
    const parsed = rawBody ? parsePersonaPatch(JSON.parse(rawBody)) : null
    if (parsed instanceof NextResponse) return parsed

    let name = parsed?.name
    const description = parsed?.description ?? ''

    if (!name) {
      const { data: profileRow } = await supabaseAdmin
        .from('users')
        .select('display_name')
        .eq('id', auth.user.id)
        .maybeSingle()

      name = getProfileName(auth.user, profileRow?.display_name)
    }

    const { data, error } = await supabaseAdmin
      .from('user_personas')
      .insert({
        user_id: auth.user.id,
        name,
        description,
        image_url: null,
        is_default: false,
      })
      .select(USER_PERSONA_SELECT)
      .single()

    if (error || !data) {
      console.error('[/api/user/personas POST]', error)
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create persona' },
        { status: 500 },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[/api/user/personas POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
