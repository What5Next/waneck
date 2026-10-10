import { normalizeCharacterGenres } from '@/lib/character-genres'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { Tables } from '@/lib/database.types'

type IntroTurn = { role: string; text: string }

export type CreateCharacterBody = {
  name: string
  short_intro?: string
  system_prompt: string
  tag?: string
  genres?: string[]
  mood?: string
  description?: string
  suggestions?: string[]
  introTurns?: IntroTurn[]
  profile_image_url?: string | null
}

type CreateCharacterResult =
  | { ok: true; character: Tables<'characters'> }
  | { ok: false; status: number; error: string }

function toSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
  return (slug || 'character') + '-' + Date.now().toString(36)
}

/**
 * 캐릭터 + 인트로 메시지 저장 — 웹 생성(/api/characters)과 관리자 생성(/api/admin/characters) 공용.
 */
export async function createCharacter(
  body: CreateCharacterBody,
  createdBy: string | null,
): Promise<CreateCharacterResult> {
  if (!body.name?.trim()) {
    return { ok: false, status: 400, error: '이름은 필수입니다' }
  }
  if (!body.system_prompt?.trim()) {
    return { ok: false, status: 400, error: '시스템 프롬프트는 필수입니다' }
  }

  const { data: character, error } = await supabaseAdmin
    .from('characters')
    .insert({
      name: body.name.trim(),
      slug: toSlug(body.name),
      system_prompt: body.system_prompt.trim(),
      short_intro: body.short_intro?.trim() || null,
      tag: body.tag?.trim() || null,
      mood: body.mood?.trim() || null,
      description: body.description?.trim() || null,
      suggestions: body.suggestions?.filter(Boolean) ?? [],
      profile_image_url: body.profile_image_url ?? null,
      is_public: true,
      genres: normalizeCharacterGenres(body.genres),
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) return { ok: false, status: 500, error: error.message }

  // 인트로 메시지 저장
  const introTurns = body.introTurns?.filter((t) => t.text.trim()) ?? []
  if (introTurns.length > 0) {
    const { error: introError } = await supabaseAdmin
      .from('character_intro_messages')
      .insert(
        introTurns.map((t, i) => ({
          character_id: character.id,
          role: t.role,
          content: t.text.trim(),
          sort_order: i,
        })),
      )
    if (introError) {
      console.error('[createCharacter] intro_messages insert error:', introError)
      return { ok: false, status: 500, error: '인트로 메시지 저장 실패: ' + introError.message }
    }
  }

  return { ok: true, character }
}
