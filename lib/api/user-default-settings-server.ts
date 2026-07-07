import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

import {
  DEFAULT_PROMPT_TITLE,
  NEW_PROMPT_TITLE,
  PERSONA_DESC_MAX,
  PERSONA_NAME_MAX,
  PROMPT_CONTENT_MAX,
  PROMPT_TITLE_MAX,
  SESSION_NOTE_MAX,
  USER_PERSONA_SELECT,
  USER_PREFERENCES_SELECT,
  USER_PROMPT_SELECT,
} from '@/lib/user-default-settings/constants'
import { getProfileName } from '@/lib/user-profile'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { Tables } from '@/lib/database.types'

export type UserPromptRow = Tables<'user_prompts'>
export type UserPersonaRow = Tables<'user_personas'>
export type UserPreferencesRow = Tables<'user_preferences'>

export type DefaultSettingsPayload = {
  preferences: UserPreferencesRow
  prompts: UserPromptRow[]
  personas: UserPersonaRow[]
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** preferences row 없을 때만 insert */
export async function ensureUserPreferences(
  userId: string,
): Promise<UserPreferencesRow> {
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('user_preferences')
    .select(USER_PREFERENCES_SELECT)
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existing) {
    return existing
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('user_preferences')
    .insert({
      user_id: userId,
      session_note: '',
      default_model_id: null,
    })
    .select(USER_PREFERENCES_SELECT)
    .single()

  if (insertError || !inserted) {
    // 동시 insert 경쟁 — 재조회
    const { data: retry, error: retryError } = await supabaseAdmin
      .from('user_preferences')
      .select(USER_PREFERENCES_SELECT)
      .eq('user_id', userId)
      .maybeSingle()

    if (retryError || !retry) {
      throw insertError ?? retryError ?? new Error('Failed to ensure preferences')
    }

    return retry
  }

  return inserted
}

async function lazySeedPrompts(userId: string): Promise<void> {
  const { count, error: countError } = await supabaseAdmin
    .from('user_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    return
  }

  const { error: insertError } = await supabaseAdmin.from('user_prompts').insert({
    user_id: userId,
    title: DEFAULT_PROMPT_TITLE,
    content: '',
    is_default: true,
    sort_order: 0,
  })

  if (insertError) {
    // partial unique 경쟁 등 — 재조회로 확인
    const { count: retryCount } = await supabaseAdmin
      .from('user_prompts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((retryCount ?? 0) === 0) {
      throw insertError
    }
  }
}

async function lazySeedPersonas(userId: string, authUser: User): Promise<void> {
  const { count, error: countError } = await supabaseAdmin
    .from('user_personas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    return
  }

  const { data: profileRow } = await supabaseAdmin
    .from('users')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  const seedPersonaName = getProfileName(authUser, profileRow?.display_name)

  const { error: insertError } = await supabaseAdmin.from('user_personas').insert({
    user_id: userId,
    name: seedPersonaName,
    description: '',
    image_url: null,
    is_default: true,
  })

  if (insertError) {
    const { count: retryCount } = await supabaseAdmin
      .from('user_personas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((retryCount ?? 0) === 0) {
      throw insertError
    }
  }
}

export async function loadDefaultSettings(
  userId: string,
  authUser: User,
): Promise<DefaultSettingsPayload> {
  await ensureUserPreferences(userId)
  await Promise.all([lazySeedPrompts(userId), lazySeedPersonas(userId, authUser)])

  const [preferencesResult, promptsResult, personasResult] = await Promise.all([
    supabaseAdmin
      .from('user_preferences')
      .select(USER_PREFERENCES_SELECT)
      .eq('user_id', userId)
      .single(),
    supabaseAdmin
      .from('user_prompts')
      .select(USER_PROMPT_SELECT)
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('user_personas')
      .select(USER_PERSONA_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
  ])

  if (preferencesResult.error || !preferencesResult.data) {
    throw preferencesResult.error ?? new Error('Failed to load preferences')
  }

  if (promptsResult.error) {
    throw promptsResult.error
  }

  if (personasResult.error) {
    throw personasResult.error
  }

  return {
    preferences: preferencesResult.data,
    prompts: promptsResult.data ?? [],
    personas: personasResult.data ?? [],
  }
}

export async function getOwnedPrompt(userId: string, promptId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_prompts')
    .select(USER_PROMPT_SELECT)
    .eq('id', promptId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function getOwnedPersona(userId: string, personaId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_personas')
    .select(USER_PERSONA_SELECT)
    .eq('id', personaId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

/** default 삭제 시 sort_order → created_at 순 첫 항목 승격 */
export async function promoteNextDefaultPrompt(
  userId: string,
  excludeId: string,
): Promise<void> {
  const { data: remaining, error } = await supabaseAdmin
    .from('user_prompts')
    .select('id')
    .eq('user_id', userId)
    .neq('id', excludeId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    throw error
  }

  const nextId = remaining?.[0]?.id
  if (!nextId) {
    return
  }

  await supabaseAdmin
    .from('user_prompts')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  const { error: promoteError } = await supabaseAdmin
    .from('user_prompts')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', nextId)
    .eq('user_id', userId)

  if (promoteError) {
    throw promoteError
  }
}

export async function promoteNextDefaultPersona(
  userId: string,
  excludeId: string,
): Promise<void> {
  const { data: remaining, error } = await supabaseAdmin
    .from('user_personas')
    .select('id')
    .eq('user_id', userId)
    .neq('id', excludeId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) {
    throw error
  }

  const nextId = remaining?.[0]?.id
  if (!nextId) {
    return
  }

  await supabaseAdmin
    .from('user_personas')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  const { error: promoteError } = await supabaseAdmin
    .from('user_personas')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', nextId)
    .eq('user_id', userId)

  if (promoteError) {
    throw promoteError
  }
}

export async function setDefaultPrompt(userId: string, promptId: string) {
  await supabaseAdmin
    .from('user_prompts')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  const { data, error } = await supabaseAdmin
    .from('user_prompts')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', promptId)
    .eq('user_id', userId)
    .select(USER_PROMPT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function setDefaultPersona(userId: string, personaId: string) {
  await supabaseAdmin
    .from('user_personas')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  const { data, error } = await supabaseAdmin
    .from('user_personas')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', personaId)
    .eq('user_id', userId)
    .select(USER_PERSONA_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function validateActiveModelId(
  modelId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('ai_models')
    .select('id')
    .eq('id', modelId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return Boolean(data)
}

export function parsePromptPatch(
  body: unknown,
): { title: string; content: string } | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { title, content } = body as { title?: unknown; content?: unknown }

  if (typeof title !== 'string' || typeof content !== 'string') {
    return NextResponse.json(
      { error: 'title and content are required' },
      { status: 400 },
    )
  }

  const trimmedTitle = title.trim()
  if (!trimmedTitle || trimmedTitle.length > PROMPT_TITLE_MAX) {
    return NextResponse.json(
      { error: `title must be 1-${PROMPT_TITLE_MAX} characters` },
      { status: 400 },
    )
  }

  if (content.length > PROMPT_CONTENT_MAX) {
    return NextResponse.json(
      { error: `content must be at most ${PROMPT_CONTENT_MAX} characters` },
      { status: 400 },
    )
  }

  return { title: trimmedTitle, content }
}

export function parsePersonaPatch(
  body: unknown,
): { name: string; description: string } | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { name, description } = body as { name?: unknown; description?: unknown }

  if (typeof name !== 'string' || typeof description !== 'string') {
    return NextResponse.json(
      { error: 'name and description are required' },
      { status: 400 },
    )
  }

  const trimmedName = name.trim()
  if (!trimmedName || trimmedName.length > PERSONA_NAME_MAX) {
    return NextResponse.json(
      { error: `name must be 1-${PERSONA_NAME_MAX} characters` },
      { status: 400 },
    )
  }

  if (description.length > PERSONA_DESC_MAX) {
    return NextResponse.json(
      { error: `description must be at most ${PERSONA_DESC_MAX} characters` },
      { status: 400 },
    )
  }

  return { name: trimmedName, description }
}

export function parsePreferencesPatch(body: unknown):
  | {
      session_note?: string
      default_model_id?: string | null
    }
  | NextResponse {
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const payload = body as {
    session_note?: unknown
    default_model_id?: unknown
  }

  const result: {
    session_note?: string
    default_model_id?: string | null
  } = {}

  if ('session_note' in payload) {
    if (typeof payload.session_note !== 'string') {
      return NextResponse.json({ error: 'invalid session_note' }, { status: 400 })
    }
    if (payload.session_note.length > SESSION_NOTE_MAX) {
      return NextResponse.json(
        { error: `session_note must be at most ${SESSION_NOTE_MAX} characters` },
        { status: 400 },
      )
    }
    result.session_note = payload.session_note
  }

  if ('default_model_id' in payload) {
    const raw = payload.default_model_id
    if (raw === null) {
      result.default_model_id = null
    } else if (typeof raw === 'string' && UUID_RE.test(raw.trim())) {
      result.default_model_id = raw.trim()
    } else {
      return NextResponse.json(
        { error: 'invalid default_model_id' },
        { status: 400 },
      )
    }
  }

  if (!('session_note' in result) && !('default_model_id' in result)) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  return result
}

export async function getNextPromptSortOrder(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('user_prompts')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  return (data?.[0]?.sort_order ?? -1) + 1
}

export { NEW_PROMPT_TITLE }

export {
  USER_PERSONA_SELECT,
  USER_PREFERENCES_SELECT,
  USER_PROMPT_SELECT,
} from '@/lib/user-default-settings/constants'
