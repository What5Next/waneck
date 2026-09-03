import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { queryKeys } from '@/lib/api/query-keys'
import {
  createUserPersona,
  deleteUserPersona,
  setDefaultUserPersona,
  updateUserPersona,
  type DefaultSettings,
  type UserPersona,
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

export function useCreateUserPersonaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; description: string }) =>
      createUserPersona(payload),
    onSuccess: (created) => {
      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        personas: [...current.personas, created],
      }))
      toast.success('Persona created.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to create persona.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export function useUpdateUserPersonaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      personaId,
      name,
      description,
    }: {
      personaId: string
      name: string
      description: string
    }) => updateUserPersona(personaId, { name, description }),
    onMutate: async ({ personaId, name, description }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
      const previous = queryClient.getQueryData<DefaultSettings>(
        queryKeys.userSettings.defaultSettings(),
      )

      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        personas: current.personas.map((persona) =>
          persona.id === personaId ? { ...persona, name, description } : persona,
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
        error instanceof ApiError ? error.message : 'Failed to save persona.',
      )
    },
    onSuccess: () => {
      toast.success('Persona saved.')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export function useSetDefaultUserPersonaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (personaId: string) => setDefaultUserPersona(personaId),
    onMutate: async (personaId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
      const previous = queryClient.getQueryData<DefaultSettings>(
        queryKeys.userSettings.defaultSettings(),
      )

      patchDefaultSettingsCache(queryClient, (current) => ({
        ...current,
        personas: current.personas.map((persona) => ({
          ...persona,
          isDefault: persona.id === personaId,
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

export function useDeleteUserPersonaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (personaId: string) => deleteUserPersona(personaId),
    onSuccess: () => {
      toast.success('Persona deleted.')
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Failed to delete persona.',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userSettings.defaultSettings(),
      })
    },
  })
}

export type { UserPersona }
