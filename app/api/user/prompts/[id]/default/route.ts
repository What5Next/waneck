import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  getOwnedPrompt,
  setDefaultPrompt,
} from '@/lib/api/user-default-settings-server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const existing = await getOwnedPrompt(auth.user.id, id)
    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const data = await setDefaultPrompt(auth.user.id, id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/user/prompts/[id]/default POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
