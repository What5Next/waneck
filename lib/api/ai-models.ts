import { apiFetch } from '@/lib/api/client'
import type { AiModel } from '@/lib/types'

/** GET /api/ai-models — 활성 AI 모델 목록 */
export async function getAiModels(): Promise<AiModel[]> {
  const data = await apiFetch<AiModel[]>('/api/ai-models')

  if (!Array.isArray(data)) {
    throw new Error('Invalid ai-models response')
  }

  return data
}
