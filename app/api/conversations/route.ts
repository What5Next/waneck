import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const characterId = searchParams.get('character_id')

    if (characterId) {
      // 특정 캐릭터의 대화 목록
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('id, title, created_at, last_message_at')
        .eq('user_id', user.id)
        .eq('character_id', characterId)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw new Error(error.message)

      return NextResponse.json(data ?? [])
    }

    // 전체 최근 대화 목록 (사이드바용)
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(
        'id, character_id, last_message_at, characters(name, profile_image_url)',
      )
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(30)

    if (error) throw new Error(error.message)

    const recentChats = (data ?? []).map((row) => {
      const character = row.characters as {
        name: string
        profile_image_url: string | null
      } | null

      return {
        id: row.id,
        character_id: row.character_id,
        character_name: character?.name ?? 'Unknown',
        character_image_url: character?.profile_image_url ?? null,
        last_message_at: row.last_message_at,
      }
    })

    return NextResponse.json(recentChats)
  } catch (err) {
    console.error('[/api/conversations GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { characterId } = await req.json() as { characterId: string }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ character_id: characterId, user_id: user.id })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    // 인트로 메시지를 초기 메시지로 삽입
    const { data: introDialogues, error: introFetchError } = await supabaseAdmin
      .from('character_intro_messages')
      .select('role, content, sort_order')
      .eq('character_id', characterId)
      .order('sort_order', { ascending: true })

    if (introFetchError) console.error('[/api/conversations] intro fetch error:', introFetchError)
    console.log('[/api/conversations] introDialogues:', introDialogues)

    if (introDialogues && introDialogues.length > 0) {
      const { error: msgInsertError } = await supabaseAdmin.from('messages').insert(
        introDialogues.map((d) => ({
          conversation_id: data.id,
          role: d.role,
          content: d.content,
        })),
      )
      if (msgInsertError) console.error('[/api/conversations] messages insert error:', msgInsertError)
    }

    return NextResponse.json({ conversationId: data.id })
  } catch (err) {
    console.error('[/api/conversations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
