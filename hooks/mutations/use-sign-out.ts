import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/browser'

/**
 * 로그아웃 — 세션 종료 후 Query 캐시 전체 제거.
 */
export function useSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear()
      router.refresh()
      router.replace('/')
    },
  })
}
