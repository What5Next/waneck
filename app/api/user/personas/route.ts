import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import { USER_PERSONA_SELECT } from '@/lib/api/user-default-settings-server'
import { getProfileName } from '@/lib/user-profile'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(_req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const { data: profileRow } = await supabaseAdmin
      .from('users')
      .select('display_name')
      .eq('id', auth.user.id)
      .maybeSingle()

    const name = getProfileName(auth.user, profileRow?.display_name)

    const { data, error } = await supabaseAdmin
      .from('user_personas')
      .insert({
        user_id: auth.user.id,
        name,
        description: '',
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
