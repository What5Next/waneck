import { apiFetch } from '@/lib/api/client'
import type {
  ConversationSettingsPatch,
  ConversationSettingsRow,
} from '@/lib/api/conversation-settings-server'

export type ConversationSettings = {
  conversationId: string
  personaName: string
  personaDescription: string
  personaImageUrl: string | null
  promptTitle: string
  promptContent: string
  modelId: string | null
  sessionNote: string
  updatedAt: string
}

export type UpdateConversationSettingsPayload = ConversationSettingsPatch

function mapConversationSettings(
  row: ConversationSettingsRow,
): ConversationSettings {
  return {
    conversationId: row.conversation_id,
    personaName: row.persona_name,
    personaDescription: row.persona_description,
    personaImageUrl: row.persona_image_url,
    promptTitle: row.prompt_title,
    promptContent: row.prompt_content,
    modelId: row.model_id,
    sessionNote: row.session_note,
    updatedAt: row.updated_at,
  }
}

export async function fetchConversationSettings(
  conversationId: string,
): Promise<ConversationSettings> {
  const data = await apiFetch<ConversationSettingsRow>(
    `/api/conversations/${conversationId}/settings`,
  )
  return mapConversationSettings(data)
}

export async function updateConversationSettings(
  conversationId: string,
  payload: UpdateConversationSettingsPayload,
): Promise<ConversationSettings> {
  const data = await apiFetch<ConversationSettingsRow>(
    `/api/conversations/${conversationId}/settings`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
  return mapConversationSettings(data)
}
