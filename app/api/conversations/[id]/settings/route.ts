import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  assertConversationOwnership,
  getOrInitConversationSettings,
  parseConversationSettingsPatch,
  updateConversationSettings,
} from '@/lib/api/conversation-settings-server'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const isOwned = await assertConversationOwnership(id, auth.user.id)
    if (!isOwned) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const data = await getOrInitConversationSettings(id, auth.user.id, auth.user)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/conversations/[id]/settings GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const isOwned = await assertConversationOwnership(id, auth.user.id)
    if (!isOwned) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = parseConversationSettingsPatch(body)
    if (parsed instanceof NextResponse) return parsed

    // 기존 대화 백필 누락/레이스 방어: PATCH 전에도 snapshot row를 보장한다.
    await getOrInitConversationSettings(id, auth.user.id, auth.user)

    const data = await updateConversationSettings(id, parsed)
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid model_id') {
      return NextResponse.json({ error: 'invalid model_id' }, { status: 400 })
    }

    console.error('[/api/conversations/[id]/settings PATCH]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
