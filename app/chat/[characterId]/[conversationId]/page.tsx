import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { CharacterSituationImage, Message } from '@/lib/types'
import { ChatPageClient } from '@/components/chat-page-client'
import { getOpeningImageUrl, isOpeningImageLabel } from '@/lib/character-opening-image'

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
    .eq('is_archived', false)
    .single()

  if (!character) notFound()

  const { data: dbMessages } = await supabaseAdmin
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const { data: openingMessages } = await supabase
    .from('character_intro_messages')
    .select('role, content')
    .eq('character_id', characterId)
    .order('sort_order', { ascending: true })

  // 새 대화는 저장된 시작 메시지만 있고, 사용자가 아직 보낸 메시지는 없다.
  const hasCurrentOpening =
    (openingMessages?.length ?? 0) > 0 &&
    (dbMessages?.length ?? 0) >= (openingMessages?.length ?? 0) &&
    (openingMessages ?? []).every((opening, index) =>
      dbMessages?.[index]?.role === opening.role &&
      dbMessages?.[index]?.content === opening.content,
    )
  const showOpeningSuggestions =
    hasCurrentOpening &&
    (dbMessages?.length ?? 0) === (openingMessages?.length ?? 0)

  const { data: situationImages } = await supabaseAdmin
    .from('character_situation_images')
    .select('*')
    .eq('character_id', characterId)
    .order('sort_order', { ascending: true })

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
      showOpeningSuggestions={showOpeningSuggestions}
      situationImages={((situationImages ?? []) as CharacterSituationImage[]).filter((image) => !isOpeningImageLabel(image.label))}
      openingImageUrl={hasCurrentOpening ? getOpeningImageUrl((situationImages ?? []) as CharacterSituationImage[]) : ''}
    />
  )
}
