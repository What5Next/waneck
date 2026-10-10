import { NextRequest, NextResponse } from 'next/server'

import { hasCharacterCreateApiKey } from '@/lib/api/character-create-access'
import {
  createCharacter,
  type CreateCharacterBody,
} from '@/lib/api/character-create-server'
import { supabaseAdmin } from '@/lib/supabase.server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type AdminCreateCharacterBody = CreateCharacterBody & {
  /** 작성자로 지정할 users.id — 생략 시 작성자 없음(null) */
  created_by?: string
}

/**
 * POST /api/admin/characters — 서버 간 캐릭터 생성(AI 자동 생성 등).
 * `Authorization: Bearer <CHARACTER_CREATE_API_KEY>` 필요.
 */
export async function POST(req: NextRequest) {
  if (!hasCharacterCreateApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: AdminCreateCharacterBody = await req.json()

  let createdBy: string | null = null
  const requestedCreatedBy = body.created_by?.trim()
  if (requestedCreatedBy) {
    if (!UUID_RE.test(requestedCreatedBy)) {
      return NextResponse.json({ error: 'created_by must be a user id' }, { status: 400 })
    }
    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', requestedCreatedBy)
      .maybeSingle()
    if (!owner) {
      return NextResponse.json({ error: 'created_by user not found' }, { status: 400 })
    }
    createdBy = owner.id
  }

  const result = await createCharacter(body, createdBy)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.character, { status: 201 })
}
