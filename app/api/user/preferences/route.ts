import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  USER_PREFERENCES_SELECT,
  parsePreferencesPatch,
  validateActiveModelId,
} from '@/lib/api/user-default-settings-server'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const body = await req.json()
    const parsed = parsePreferencesPatch(body)
    if (parsed instanceof NextResponse) return parsed

    if (
      parsed.default_model_id != null &&
      !(await validateActiveModelId(parsed.default_model_id))
    ) {
      return NextResponse.json({ error: 'invalid default_model_id' }, { status: 400 })
    }

    const updatePayload: {
      updated_at: string
      session_note?: string
      default_model_id?: string | null
    } = {
      updated_at: new Date().toISOString(),
    }

    if ('session_note' in parsed) {
      updatePayload.session_note = parsed.session_note
    }

    if ('default_model_id' in parsed) {
      updatePayload.default_model_id = parsed.default_model_id
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .update(updatePayload)
      .eq('user_id', auth.user.id)
      .select(USER_PREFERENCES_SELECT)
      .single()

    if (error || !data) {
      console.error('[/api/user/preferences PATCH]', error)
      return NextResponse.json(
        { error: error?.message ?? 'Failed to update preferences' },
        { status: 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/user/preferences PATCH]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
