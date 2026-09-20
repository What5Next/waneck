import { apiFetch } from '@/lib/api/client'
import type { Character, CharacterWithDetail } from '@/lib/types'

/** GET /api/characters — 공개 캐릭터 전체 목록 */
export async function getCharacters(): Promise<Character[]> {
  const data = await apiFetch<Character[]>('/api/characters')

  if (!Array.isArray(data)) {
    throw new Error('Invalid characters response')
  }

  return data
}

/** GET /api/characters/[id] — 캐릭터 상세 */
export async function getCharacterDetail(
  characterId: string,
): Promise<CharacterWithDetail> {
  const data = await apiFetch<CharacterWithDetail>(
    `/api/characters/${characterId}`,
  )

  if (!data?.id) {
    throw new Error('Invalid character detail response')
  }

  return {
    ...data,
    creator: data.creator ?? null,
    intro_messages: data.intro_messages ?? [],
    is_liked: data.is_liked ?? false,
  }
}

type IntroTurn = { role: string; text: string }

export type CreateCharacterBody = {
  name: string
  short_intro?: string
  system_prompt: string
  tag?: string
  genres?: string[]
  mood?: string
  description?: string
  suggestions?: string[]
  introTurns?: IntroTurn[]
  profile_image_url?: string | null
}

export type UpdateCharacterBody = Partial<CreateCharacterBody>

/** GET /api/characters/mine — 내가 만든 캐릭터 목록 */
export async function getMyCharacters(): Promise<Character[]> {
  const data = await apiFetch<Character[]>('/api/characters/mine')

  if (!Array.isArray(data)) {
    throw new Error('Invalid my characters response')
  }

  return data
}

type GetSimilarCharactersOptions = {
  limit?: number
  excludeIds?: string[]
}

/** GET /api/characters/[id]/similar — 유사 캐릭터 목록 */
export async function getSimilarCharacters(
  characterId: string,
  options: GetSimilarCharactersOptions = {},
): Promise<Character[]> {
  const params = new URLSearchParams()
  if (options.limit != null) {
    params.set('limit', String(options.limit))
  }

  const excludeIds = (options.excludeIds ?? []).filter((id) => id !== characterId)
  if (excludeIds.length > 0) {
    params.set('exclude', excludeIds.join(','))
  }

  const query = params.toString()
  const url = query
    ? `/api/characters/${characterId}/similar?${query}`
    : `/api/characters/${characterId}/similar`

  const data = await apiFetch<Character[]>(url)

  if (!Array.isArray(data)) {
    throw new Error('Invalid similar characters response')
  }

  return data
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

/** PATCH /api/characters/[id] — 캐릭터 수정 */
export async function updateCharacter(
  characterId: string,
  body: UpdateCharacterBody,
): Promise<Character> {
  return apiFetch<Character>(`/api/characters/${characterId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
