import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  getOwnedPersona,
  setDefaultPersona,
} from '@/lib/api/user-default-settings-server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const existing = await getOwnedPersona(auth.user.id, id)
    if (!existing) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    }

    const data = await setDefaultPersona(auth.user.id, id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/user/personas/[id]/default POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
