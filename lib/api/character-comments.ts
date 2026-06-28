import { apiFetch } from '@/lib/api/client'
import type { CharacterComment } from '@/lib/types'

export type CreateCharacterCommentInput = {
  content: string
  parentId?: string | null
}

export type DeleteCharacterCommentResult = {
  deleted_count: number
}

/** GET /api/characters/[id]/comments — nested top-level + replies */
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
  input: CreateCharacterCommentInput,
): Promise<CharacterComment> {
  return apiFetch<CharacterComment>(`/api/characters/${characterId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: input.content,
      parent_id: input.parentId ?? null,
    }),
  })
}

/** PATCH /api/characters/[id]/comments/[commentId] */
export async function updateCharacterComment(
  characterId: string,
  commentId: string,
  content: string,
): Promise<CharacterComment> {
  return apiFetch<CharacterComment>(
    `/api/characters/${characterId}/comments/${commentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
  )
}

/** DELETE /api/characters/[id]/comments/[commentId] */
export async function deleteCharacterComment(
  characterId: string,
  commentId: string,
): Promise<DeleteCharacterCommentResult> {
  return apiFetch<DeleteCharacterCommentResult>(
    `/api/characters/${characterId}/comments/${commentId}`,
    { method: 'DELETE' },
  )
}
