import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from '@/lib/api/client'
import { updateProfile } from '@/lib/api/profile'
import { queryKeys } from '@/lib/api/query-keys'
import type { ProfileSummary } from '@/lib/user-profile'

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.me() })
      const previous = queryClient.getQueryData<ProfileSummary>(
        queryKeys.profile.me(),
      )

      queryClient.setQueryData<ProfileSummary>(queryKeys.profile.me(), (current) =>
        current ? { ...current, display_name: payload.display_name } : current,
      )

      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.profile.me(), context.previous)
      }
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to update profile.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
    },
  })
}
