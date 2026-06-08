import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { Message } from '@/lib/types'
import { ChatPageClient } from '@/components/chat-page-client'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string; conversationId: string }>
}) {
  const { characterId, conversationId } = await params

  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()

  if (!character) notFound()

  const { data: dbMessages } = await supabaseAdmin
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const initialMessages: Message[] = (dbMessages ?? []).map((m) => ({
    role: m.role as 'user' | 'model',
    content: m.content,
    time: new Date(m.created_at).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))

  return (
    <ChatPageClient
      character={character}
      conversationId={conversationId}
      initialMessages={initialMessages}
    />
  )
}
