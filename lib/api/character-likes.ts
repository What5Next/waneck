import { apiFetch } from '@/lib/api/client'
import type { Character } from '@/lib/types'

/** POST /api/characters/[id]/likes */
export async function addCharacterLike(characterId: string): Promise<{ is_liked: boolean }> {
  return apiFetch<{ is_liked: boolean }>(`/api/characters/${characterId}/likes`, {
    method: 'POST',
  })
}

/** DELETE /api/characters/[id]/likes */
export async function removeCharacterLike(characterId: string): Promise<{ is_liked: boolean }> {
  return apiFetch<{ is_liked: boolean }>(`/api/characters/${characterId}/likes`, {
    method: 'DELETE',
  })
}

/** GET /api/characters/liked */
export async function getLikedCharacters(): Promise<Character[]> {
  const data = await apiFetch<Character[]>('/api/characters/liked')
  if (!Array.isArray(data)) {
    throw new Error('Invalid liked characters response')
  }
  return data
}
