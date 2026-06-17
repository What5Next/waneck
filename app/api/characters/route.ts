import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function GET() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

type IntroTurn = { role: string; text: string }

type CreateCharacterBody = {
  name: string
  short_intro?: string
  system_prompt: string
  tag?: string
  mood?: string
  description?: string
  suggestions?: string[]
  introTurns?: IntroTurn[]
  profile_image_url?: string | null
}

function toSlug(name: string): string {
  return (
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
    'character'
  ) + '-' + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  const body: CreateCharacterBody = await req.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: '이름은 필수입니다' }, { status: 400 })
  }
  if (!body.system_prompt?.trim()) {
    return NextResponse.json({ error: '시스템 프롬프트는 필수입니다' }, { status: 400 })
  }

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

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
      genres: [],
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
      console.error('[/api/characters] intro_messages insert error:', introError)
      return NextResponse.json({ error: '인트로 메시지 저장 실패: ' + introError.message }, { status: 500 })
    }
  }

  return NextResponse.json(character, { status: 201 })
}
