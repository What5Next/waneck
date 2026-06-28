import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'

/** 인증 필수 — 없으면 401 Response 반환 */
export async function requireAuthenticatedUser() {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return {
      user: null as null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, errorResponse: null as null }
}

/** 캐릭터 존재 여부 확인 — 없으면 404 */
export async function getCharacterOr404(characterId: string) {
  const { data, error } = await supabaseAdmin
    .from('characters')
    .select('id, created_by')
    .eq('id', characterId)
    .maybeSingle()

  if (error || !data) {
    return {
      character: null as null,
      errorResponse: NextResponse.json(
        { error: error?.message ?? 'Character not found' },
        { status: 404 },
      ),
    }
  }

  return { character: data, errorResponse: null as null }
}

/** 본인 캐릭터 좋아요 차단 */
export function selfLikeForbiddenResponse(
  createdBy: string | null,
  userId: string,
) {
  if (createdBy && createdBy === userId) {
    return NextResponse.json(
      { error: 'Cannot like your own character' },
      { status: 403 },
    )
  }
  return null
}

/** 댓글 content 검증 — 실패 시 400 */
export function parseCommentContent(body: unknown): string | NextResponse {
  if (!body || typeof body !== 'object' || !('content' in body)) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const content = String((body as { content: unknown }).content).trim()
  if (content.length < 1 || content.length > 1000) {
    return NextResponse.json(
      { error: 'content must be between 1 and 1000 characters' },
      { status: 400 },
    )
  }

  return content
}
