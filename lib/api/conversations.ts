import { apiFetch } from '@/lib/api/client'

/** GET /api/conversations 응답 항목 (사이드바용) */
export type RecentConversation = {
  id: string
  character_id: string
  character_name: string
  character_image_url: string | null
  last_message_at: string | null
}

/** GET /api/conversations?character_id= 응답 항목 */
export type CharacterConversation = {
  id: string
  title: string | null
  created_at: string
  last_message_at: string | null
}

/** GET /api/conversations — 로그인 사용자 최근 대화 목록 */
export async function getConversations(): Promise<RecentConversation[]> {
  const data = await apiFetch<RecentConversation[]>('/api/conversations')

  if (!Array.isArray(data)) {
    throw new Error('Invalid conversations response')
  }

  return data
}

/** GET /api/conversations?character_id= — 특정 캐릭터의 대화 목록 */
export async function getCharacterConversations(
  characterId: string,
): Promise<CharacterConversation[]> {
  const data = await apiFetch<CharacterConversation[]>(
    `/api/conversations?character_id=${characterId}`,
  )

  if (!Array.isArray(data)) {
    throw new Error('Invalid conversations response')
  }

  return data
}

/** POST /api/conversations — 새 대화방 생성 */
export async function createConversation(
  characterId: string,
): Promise<{ conversationId: string }> {
  return apiFetch<{ conversationId: string }>('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId }),
  })
}

/** DELETE /api/conversations/[id] — 대화방 삭제 */
export async function deleteConversation(id: string): Promise<void> {
  await apiFetch(`/api/conversations/${id}`, { method: 'DELETE' })
}
