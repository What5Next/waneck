import { apiFetch } from '@/lib/api/client'
import type { Character } from '@/lib/types'

/** GET /api/characters — 공개 캐릭터 전체 목록 */
export async function getCharacters(): Promise<Character[]> {
  const data = await apiFetch<Character[]>('/api/characters')

  if (!Array.isArray(data)) {
    throw new Error('Invalid characters response')
  }

  return data
}

type IntroTurn = { role: string; text: string }

export type CreateCharacterBody = {
  name: string
  short_intro?: string
  system_prompt: string
  tag?: string
  mood?: string
  description?: string
  suggestions?: string[]
  introTurns?: IntroTurn[]
  profile_image_url?: string | null
}

/** POST /api/characters — 캐릭터 생성 */
export async function createCharacter(
  body: CreateCharacterBody,
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
