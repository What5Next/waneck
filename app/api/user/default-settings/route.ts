import { NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import { loadDefaultSettings } from '@/lib/api/user-default-settings-server'

export async function GET() {
  try {
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const data = await loadDefaultSettings(auth.user.id, auth.user)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/user/default-settings GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
