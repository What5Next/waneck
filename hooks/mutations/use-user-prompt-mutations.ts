import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { queryKeys } from '@/lib/api/query-keys'
import {
  createUserPrompt,
  deleteUserPrompt,
  setDefaultUserPrompt,
  updateUserPrompt,
  type DefaultSettings,
  type UserPrompt,
} from '@/lib/api/user-settings'
import { ApiError } from '@/lib/api/client'

function patchDefaultSettingsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (current: DefaultSettings) => DefaultSettings,
) {
  queryClient.setQueryData<DefaultSettings>(
    queryKeys.userSettings.defaultSettings(),
    (current) => (current ? updater(current) : current),
  )
}

export function useCreateUserPromptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUserPrompt,
    onSuccess: (created) => {
      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        prompts: [...current.prompts, created],
      }))
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to create prompt.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export function useUpdateUserPromptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      promptId,
      title,
      content,
    }: {
      promptId: string
      title: string
      content: string
    }) => updateUserPrompt(promptId, { title, content }),
    onMutate: async ({ promptId, title, content }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
      const previous = queryClient.getQueryData<DefaultSettings>(
        queryKeys.userSettings.defaultSettings(),
      )

      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        prompts: current.prompts.map((prompt) =>
          prompt.id === promptId ? { ...prompt, title, content } : prompt,
        ),
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
        error instanceof ApiError ? error.message : 'Failed to save prompt.',
      )
    },
    onSuccess: () => {
      toast.success('Prompt saved.')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export function useSetDefaultUserPromptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (promptId: string) => setDefaultUserPrompt(promptId),
    onMutate: async (promptId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
      const previous = queryClient.getQueryData<DefaultSettings>(
        queryKeys.userSettings.defaultSettings(),
      )

      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        prompts: current.prompts.map((prompt) => ({
          ...prompt,
          isDefault: prompt.id === promptId,
        })),
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
        error instanceof ApiError ? error.message : 'Failed to set default.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export function useDeleteUserPromptMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (promptId: string) => deleteUserPrompt(promptId),
    onSuccess: () => {
      toast.success('Prompt deleted.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to delete prompt.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export type { UserPrompt }
