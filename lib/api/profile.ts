import { apiFetch } from '@/lib/api/client'
import type { ProfileSummary } from '@/lib/user-profile'

/**
 * GET /api/profile — 로그인 사용자 프로필 요약.
 * 401이면 ApiError(401)를 throw한다. (호출부에서 리다이렉트 처리)
 */
export async function getProfile(): Promise<ProfileSummary> {
  return apiFetch<ProfileSummary>('/api/profile')
}
