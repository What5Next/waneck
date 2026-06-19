import { apiFetch } from '@/lib/api/client'

/** GET /api/conversations 응답 항목 (사이드바용) */
export type RecentConversation = {
  id: string
  character_id: string
  character_name: string
  character_image_url: string | null
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

/**
 * POST /api/conversations — 대화방 생성 또는 기존 대화 재사용.
 * P6 mutation hook에서 사용 예정.
 */
export async function createConversation(
  characterId: string,
): Promise<{ conversationId: string }> {
  return apiFetch<{ conversationId: string }>('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId }),
  })
}
