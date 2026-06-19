import { apiFetch } from '@/lib/api/client'
import type { Character } from '@/lib/types'

/** GET /api/characters — 공개 캐릭터 전체 목록 */
export async function getCharacters(): Promise<Character[]> {
  const data = await apiFetch<Character[]>('/api/characters')

  // API 응답 형식이 깨졌을 때 조기 감지
  if (!Array.isArray(data)) {
    throw new Error('Invalid characters response')
  }

  return data
}
