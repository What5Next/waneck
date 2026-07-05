import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  updateConversationSettings,
  type ConversationSettings,
  type UpdateConversationSettingsPayload,
} from '@/lib/api/conversation-settings'
import { ApiError } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'

export function useUpdateConversationSettingsMutation(
  conversationId: string | null | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateConversationSettingsPayload) => {
      if (!conversationId) {
        throw new Error('Conversation is not ready.')
      }

      return updateConversationSettings(conversationId, payload)
    },
    onMutate: async (payload) => {
      if (!conversationId) return { previous: undefined }

      const queryKey = queryKeys.conversations.settings(conversationId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ConversationSettings>(queryKey)

      queryClient.setQueryData<ConversationSettings>(queryKey, (current) =>
        current
          ? {
              ...current,
              ...(payload.persona_name !== undefined
                ? { personaName: payload.persona_name }
                : {}),
              ...(payload.persona_description !== undefined
                ? { personaDescription: payload.persona_description }
                : {}),
              ...(payload.persona_image_url !== undefined
                ? { personaImageUrl: payload.persona_image_url }
                : {}),
              ...(payload.prompt_title !== undefined
                ? { promptTitle: payload.prompt_title }
                : {}),
              ...(payload.prompt_content !== undefined
                ? { promptContent: payload.prompt_content }
                : {}),
              ...(payload.model_id !== undefined ? { modelId: payload.model_id } : {}),
              ...(payload.session_note !== undefined
                ? { sessionNote: payload.session_note }
                : {}),
            }
          : current,
      )

      return { previous }
    },
    onError: (error, _vars, context) => {
      if (conversationId && context?.previous) {
        queryClient.setQueryData(
          queryKeys.conversations.settings(conversationId),
          context.previous,
        )
      }

      toast.error(
        error instanceof ApiError ? error.message : 'Failed to save settings.',
      )
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(
        queryKeys.conversations.settings(saved.conversationId),
        saved,
      )
    },
    onSettled: () => {
      if (!conversationId) return

      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.settings(conversationId),
      })
    },
  })
}
