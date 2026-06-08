import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'
import ChatWindow from '@/components/chat-window'
import type { Message } from '@/lib/types'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string; seed: string }>
}) {
  const { characterId, seed } = await params

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()

  if (!character) notFound()

  // 로그인된 유저의 기존 대화 불러오기
  let conversationId: string | null = null
  let initialMessages: Message[] = []

  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (user) {
      const { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('character_id', characterId)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()

      if (conversation) {
        conversationId = conversation.id

        const { data: dbMessages } = await supabaseAdmin
          .from('messages')
          .select('role, content, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (dbMessages) {
          initialMessages = dbMessages.map((m) => ({
            role: m.role as 'user' | 'model',
            content: m.content,
            time: new Date(m.created_at).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        }
      }
    }
  } catch {
    // 인증 실패 또는 DB 오류 시 빈 대화로 시작
  }

  return (
    <ChatWindow
      character={character}
      seed={seed}
      conversationId={conversationId}
      initialMessages={initialMessages}
    />
  )
}
