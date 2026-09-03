import { apiFetch } from '@/lib/api/client'
import type {
  DefaultSettingsPayload,
  UserPersonaRow,
  UserPreferencesRow,
  UserPromptRow,
} from '@/lib/api/user-default-settings-server'

export type UserPrompt = {
  id: string
  title: string
  content: string
  isDefault: boolean
  sortOrder: number
}

export type UserPersona = {
  id: string
  name: string
  description: string
  imageUrl: string | null
  isDefault: boolean
}

export type UserPreferences = {
  defaultModelId: string | null
  sessionNote: string
  updatedAt: string
}

export type DefaultSettings = {
  preferences: UserPreferences
  prompts: UserPrompt[]
  personas: UserPersona[]
}

function mapPrompt(row: UserPromptRow): UserPrompt {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
  }
}

function mapPersona(row: UserPersonaRow): UserPersona {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    isDefault: row.is_default,
  }
}

function mapPreferences(row: UserPreferencesRow): UserPreferences {
  return {
    defaultModelId: row.default_model_id,
    sessionNote: row.session_note,
    updatedAt: row.updated_at,
  }
}

function mapDefaultSettings(data: DefaultSettingsPayload): DefaultSettings {
  return {
    preferences: mapPreferences(data.preferences),
    prompts: data.prompts.map(mapPrompt),
    personas: data.personas.map(mapPersona),
  }
}

export function getDefaultPrompt(settings: DefaultSettings): UserPrompt | null {
  return (
    settings.prompts.find((prompt) => prompt.isDefault) ??
    settings.prompts[0] ??
    null
  )
}

export function getDefaultPersona(settings: DefaultSettings): UserPersona | null {
  return (
    settings.personas.find((persona) => persona.isDefault) ??
    settings.personas[0] ??
    null
  )
}

export async function fetchDefaultSettings(): Promise<DefaultSettings> {
  const data = await apiFetch<DefaultSettingsPayload>('/api/user/default-settings')
  return mapDefaultSettings(data)
}

export async function createUserPrompt(): Promise<UserPrompt> {
  const data = await apiFetch<UserPromptRow>('/api/user/prompts', { method: 'POST' })
  return mapPrompt(data)
}

export async function updateUserPrompt(
  promptId: string,
  payload: { title: string; content: string },
): Promise<UserPrompt> {
  const data = await apiFetch<UserPromptRow>(`/api/user/prompts/${promptId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapPrompt(data)
}

export async function deleteUserPrompt(promptId: string): Promise<void> {
  await apiFetch<void>(`/api/user/prompts/${promptId}`, { method: 'DELETE' })
}

export async function setDefaultUserPrompt(promptId: string): Promise<UserPrompt> {
  const data = await apiFetch<UserPromptRow>(
    `/api/user/prompts/${promptId}/default`,
    { method: 'POST' },
  )
  return mapPrompt(data)
}

export async function createUserPersona(payload: {
  name: string
  description: string
}): Promise<UserPersona> {
  const data = await apiFetch<UserPersonaRow>('/api/user/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapPersona(data)
}

export async function updateUserPersona(
  personaId: string,
  payload: { name: string; description: string },
): Promise<UserPersona> {
  const data = await apiFetch<UserPersonaRow>(`/api/user/personas/${personaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapPersona(data)
}

export async function deleteUserPersona(personaId: string): Promise<void> {
  await apiFetch<void>(`/api/user/personas/${personaId}`, { method: 'DELETE' })
}

export async function setDefaultUserPersona(personaId: string): Promise<UserPersona> {
  const data = await apiFetch<UserPersonaRow>(
    `/api/user/personas/${personaId}/default`,
    { method: 'POST' },
  )
  return mapPersona(data)
}

export async function updateUserPreferences(payload: {
  session_note?: string
  default_model_id?: string | null
}): Promise<UserPreferences> {
  const data = await apiFetch<UserPreferencesRow>('/api/user/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return mapPreferences(data)
}
