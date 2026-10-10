import { timingSafeEqual } from 'node:crypto'

import type { NextRequest } from 'next/server'

/**
 * 서버 간 캐릭터 생성(AI 자동 생성 등)용 API 키 검사.
 * `Authorization: Bearer <CHARACTER_CREATE_API_KEY>` 헤더가 일치하면 true.
 * 환경변수가 비어 있으면 항상 false.
 */
export function hasCharacterCreateApiKey(req: NextRequest): boolean {
  const expected = process.env.CHARACTER_CREATE_API_KEY
  const header = req.headers.get('authorization')
  if (!expected || !header?.startsWith('Bearer ')) return false

  const a = Buffer.from(header.slice('Bearer '.length))
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
