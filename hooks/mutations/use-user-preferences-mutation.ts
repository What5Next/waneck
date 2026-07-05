import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { queryKeys } from '@/lib/api/query-keys'
import {
  updateUserPreferences,
  type DefaultSettings,
} from '@/lib/api/user-settings'
import { ApiError } from '@/lib/api/client'

function patchPreferencesCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (current: DefaultSettings['preferences']) => DefaultSettings['preferences'],
) {
  queryClient.setQueryData<DefaultSettings>(
    queryKeys.userSettings.defaultSettings(),
    (current) =>
      current
        ? { ...current, preferences: updater(current.preferences) }
        : current,
  )
}

export function useUpdateUserPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserPreferences,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
      const previous = queryClient.getQueryData<DefaultSettings>(
        queryKeys.userSettings.defaultSettings(),
      )

      patchPreferencesCache(queryClient, (prefs) => ({
        ...prefs,
        ...(payload.session_note !== undefined
          ? { sessionNote: payload.session_note }
          : {}),
        ...(payload.default_model_id !== undefined
          ? { defaultModelId: payload.default_model_id }
          : {}),
      }))

      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.userSettings.defaultSettings(),
          context.previous,
        )
      }
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to save settings.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}
