'use client'

import { useProfileQuery } from '@/hooks/queries/use-profile-query'
import { useAuth } from '@/hooks/use-auth'
import { GUEST_NAME } from '@/lib/template-vars'
import { getProfileName } from '@/lib/user-profile'

/**
 * 화면의 {{user}} 자리에 넣을 이름.
 * 로그인: 프로필 표시 이름 → 소셜 계정 이름 → 이메일 앞부분, 로그아웃: Guest
 */
export function useUserLabel(): string {
  const { user, isAuthenticated } = useAuth()
  const { data: profile } = useProfileQuery({ enabled: isAuthenticated })

  if (!user) return GUEST_NAME
  return getProfileName(user, profile?.display_name)
}
