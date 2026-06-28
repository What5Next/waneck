import { apiFetch } from '@/lib/api/client'
import type { CharacterComment } from '@/lib/types'

/** GET /api/characters/[id]/comments */
export async function getCharacterComments(characterId: string): Promise<CharacterComment[]> {
  const data = await apiFetch<CharacterComment[]>(`/api/characters/${characterId}/comments`)
  if (!Array.isArray(data)) {
    throw new Error('Invalid comments response')
  }
  return data
}

/** POST /api/characters/[id]/comments */
export async function createCharacterComment(
  characterId: string,
  content: string,
): Promise<CharacterComment> {
  return apiFetch<CharacterComment>(`/api/characters/${characterId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

/** PATCH /api/characters/[id]/comments */
export async function updateCharacterComment(
  characterId: string,
  content: string,
): Promise<CharacterComment> {
  return apiFetch<CharacterComment>(`/api/characters/${characterId}/comments`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

/** DELETE /api/characters/[id]/comments */
export async function deleteCharacterComment(characterId: string): Promise<void> {
  await apiFetch<null>(`/api/characters/${characterId}/comments`, {
    method: 'DELETE',
  })
}
