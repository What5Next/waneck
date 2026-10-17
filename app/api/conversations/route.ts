import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'
import { seedConversationSettingsFromDefaults } from '@/lib/api/conversation-settings-server'

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

      return NextResponse.json(
        (data ?? []).sort((a, b) =>
          Date.parse(b.last_message_at ?? b.created_at) -
          Date.parse(a.last_message_at ?? a.created_at),
        ),
      )
    }

    // 마지막 메시지가 없는 새 대화도 후보에 포함한다. 각 기준에서 30개씩 가져온 뒤
    // 실제 최근 활동 시각으로 정렬해 최종 30개만 노출한다.
    const recentConversations = () => supabaseAdmin
      .from('conversations')
      .select(
        'id, character_id, created_at, last_message_at, characters!inner(name, profile_image_url)',
      )
      .eq('user_id', user.id)
      .eq('characters.is_archived', false)

    const [lastMessageResult, createdResult] = await Promise.all([
      recentConversations()
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(30),
      recentConversations()
        .order('created_at', { ascending: false })
        .limit(30),
    ])

    if (lastMessageResult.error) throw new Error(lastMessageResult.error.message)
    if (createdResult.error) throw new Error(createdResult.error.message)

    const conversationRows = Array.from(new Map(
      [...(lastMessageResult.data ?? []), ...(createdResult.data ?? [])]
        .map((row) => [row.id, row] as const),
    ).values())

    // 각 대화방의 마지막 메시지 미리보기 — created_at 내림차순으로 가져와
    // conversation_id별 첫 등장(=최신) 메시지만 사용한다
    const conversationIds = conversationRows.map((row) => row.id)
    const lastMessageByConversationId = new Map<string, { content: string; created_at: string }>()

    if (conversationIds.length > 0) {
      const { data: messageRows, error: messagesError } = await supabaseAdmin
        .from('messages')
        .select('conversation_id, content, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })

      if (messagesError) throw new Error(messagesError.message)

      for (const row of messageRows ?? []) {
        if (!lastMessageByConversationId.has(row.conversation_id)) {
          lastMessageByConversationId.set(row.conversation_id, { content: row.content, created_at: row.created_at })
        }
      }
    }

    const recentChats = conversationRows.map((row) => {
      const character = row.characters as {
        name: string
        profile_image_url: string | null
      } | null

      const lastMessage = lastMessageByConversationId.get(row.id)
      const lastActivityAt = [row.created_at, row.last_message_at, lastMessage?.created_at]
        .filter((date): date is string => Boolean(date))
        .sort((a, b) => Date.parse(b) - Date.parse(a))[0]

      return {
        id: row.id,
        character_id: row.character_id,
        character_name: character?.name ?? 'Unknown',
        character_image_url: character?.profile_image_url ?? null,
        last_message_at: lastActivityAt,
        last_message_preview: lastMessage?.content ?? null,
      }
    })

    return NextResponse.json(
      recentChats.sort((a, b) => Date.parse(b.last_message_at) - Date.parse(a.last_message_at)).slice(0, 30),
    )
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

    await seedConversationSettingsFromDefaults(data.id, user.id, user)

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
