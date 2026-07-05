import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

import type { Tables } from '@/lib/database.types'
import { supabaseAdmin } from '@/lib/supabase.server'
import {
  loadDefaultSettings,
  validateActiveModelId,
} from '@/lib/api/user-default-settings-server'
import {
  CONVERSATION_SETTINGS_SELECT,
  PERSONA_DESC_MAX,
  PERSONA_NAME_MAX,
  PROMPT_CONTENT_MAX,
  PROMPT_TITLE_MAX,
  SESSION_NOTE_MAX,
} from '@/lib/user-default-settings/constants'

export type ConversationSettingsRow = Tables<'conversation_settings'>

export type ConversationSettingsPatch = {
  persona_name?: string
  persona_description?: string
  persona_image_url?: string | null
  prompt_title?: string
  prompt_content?: string
  model_id?: string | null
  session_note?: string
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function assertConversationOwnership(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return Boolean(data)
}

export async function seedConversationSettingsFromDefaults(
  conversationId: string,
  userId: string,
  authUser: User,
): Promise<ConversationSettingsRow> {
  const defaults = await loadDefaultSettings(userId, authUser)
  const defaultPrompt =
    defaults.prompts.find((prompt) => prompt.is_default) ??
    defaults.prompts[0] ??
    null
  const defaultPersona =
    defaults.personas.find((persona) => persona.is_default) ??
    defaults.personas[0] ??
    null

  const insertPayload = {
    conversation_id: conversationId,
    persona_name: defaultPersona?.name ?? '',
    persona_description: defaultPersona?.description ?? '',
    persona_image_url: defaultPersona?.image_url ?? null,
    prompt_title: defaultPrompt?.title ?? '',
    prompt_content: defaultPrompt?.content ?? '',
    model_id: defaults.preferences.default_model_id,
    session_note: defaults.preferences.session_note,
  }

  const { data, error } = await supabaseAdmin
    .from('conversation_settings')
    .upsert(insertPayload, {
      onConflict: 'conversation_id',
      ignoreDuplicates: true,
    })
    .select(CONVERSATION_SETTINGS_SELECT)
    .single()

  if (!error && data) {
    return data
  }

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('conversation_settings')
    .select(CONVERSATION_SETTINGS_SELECT)
    .eq('conversation_id', conversationId)
    .maybeSingle()

  if (selectError || !existing) {
    throw error ?? selectError ?? new Error('Failed to seed conversation settings')
  }

  return existing
}

export async function getOrInitConversationSettings(
  conversationId: string,
  userId: string,
  authUser: User,
): Promise<ConversationSettingsRow> {
  const { data: existing, error } = await supabaseAdmin
    .from('conversation_settings')
    .select(CONVERSATION_SETTINGS_SELECT)
    .eq('conversation_id', conversationId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (existing) {
    return existing
  }

  return seedConversationSettingsFromDefaults(conversationId, userId, authUser)
}

export async function updateConversationSettings(
  conversationId: string,
  patch: ConversationSettingsPatch,
): Promise<ConversationSettingsRow> {
  if (patch.model_id != null && !(await validateActiveModelId(patch.model_id))) {
    throw new Error('invalid model_id')
  }

  const { data, error } = await supabaseAdmin
    .from('conversation_settings')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId)
    .select(CONVERSATION_SETTINGS_SELECT)
    .single()

  if (error || !data) {
    throw error ?? new Error('Failed to update conversation settings')
  }

  return data
}

export function buildConversationSystemInstruction({
  characterSystemPrompt,
  settings,
}: {
  characterSystemPrompt: string
  settings: ConversationSettingsRow
}): string {
  const sections = [
    characterSystemPrompt,
    settings.prompt_content
      ? `Additional output instructions:\n${settings.prompt_content}`
      : '',
    settings.persona_name || settings.persona_description
      ? [
          'User persona snapshot:',
          settings.persona_name ? `Name: ${settings.persona_name}` : '',
          settings.persona_description
            ? `Description: ${settings.persona_description}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : '',
    settings.session_note ? `Session note:\n${settings.session_note}` : '',
    '행동이나 상황을 묘사할 때는 *행동 내용* 형식으로 별표 하나로 감싸서 표현하세요. 예: *조용히 미소 지으며* 안녕하세요.',
  ]

  return sections.filter((section) => section.trim()).join('\n\n')
}

function readOptionalString(
  payload: Record<string, unknown>,
  key: keyof ConversationSettingsPatch,
  maxLength: number,
): string | undefined | NextResponse {
  if (!(key in payload)) {
    return undefined
  }

  const raw = payload[key]
  if (typeof raw !== 'string') {
    return NextResponse.json({ error: `invalid ${key}` }, { status: 400 })
  }

  if (raw.length > maxLength) {
    return NextResponse.json(
      { error: `${key} must be at most ${maxLength} characters` },
      { status: 400 },
    )
  }

  return raw
}

export function parseConversationSettingsPatch(
  body: unknown,
): ConversationSettingsPatch | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const result: ConversationSettingsPatch = {}

  const personaName = readOptionalString(payload, 'persona_name', PERSONA_NAME_MAX)
  if (personaName instanceof NextResponse) return personaName
  if (personaName !== undefined) {
    const trimmedName = personaName.trim()
    if (!trimmedName) {
      return NextResponse.json({ error: 'persona_name is required' }, { status: 400 })
    }
    result.persona_name = trimmedName
  }

  const personaDescription = readOptionalString(
    payload,
    'persona_description',
    PERSONA_DESC_MAX,
  )
  if (personaDescription instanceof NextResponse) return personaDescription
  if (personaDescription !== undefined) {
    result.persona_description = personaDescription
  }

  if ('persona_image_url' in payload) {
    const raw = payload.persona_image_url
    if (raw === null) {
      result.persona_image_url = null
    } else if (typeof raw === 'string') {
      result.persona_image_url = raw
    } else {
      return NextResponse.json({ error: 'invalid persona_image_url' }, { status: 400 })
    }
  }

  const promptTitle = readOptionalString(payload, 'prompt_title', PROMPT_TITLE_MAX)
  if (promptTitle instanceof NextResponse) return promptTitle
  if (promptTitle !== undefined) {
    const trimmedTitle = promptTitle.trim()
    if (!trimmedTitle) {
      return NextResponse.json({ error: 'prompt_title is required' }, { status: 400 })
    }
    result.prompt_title = trimmedTitle
  }

  const promptContent = readOptionalString(
    payload,
    'prompt_content',
    PROMPT_CONTENT_MAX,
  )
  if (promptContent instanceof NextResponse) return promptContent
  if (promptContent !== undefined) {
    result.prompt_content = promptContent
  }

  if ('model_id' in payload) {
    const raw = payload.model_id
    if (raw === null) {
      result.model_id = null
    } else if (typeof raw === 'string' && UUID_RE.test(raw.trim())) {
      result.model_id = raw.trim()
    } else {
      return NextResponse.json({ error: 'invalid model_id' }, { status: 400 })
    }
  }

  const sessionNote = readOptionalString(payload, 'session_note', SESSION_NOTE_MAX)
  if (sessionNote instanceof NextResponse) return sessionNote
  if (sessionNote !== undefined) {
    result.session_note = sessionNote
  }

  if (Object.keys(result).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  return result
}

export { CONVERSATION_SETTINGS_SELECT }
