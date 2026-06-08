import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase.server'
import ChatWindow from '@/components/chat-window'
import type { Message } from '@/lib/types'
import { MobileShell } from '@/components/mobile-shell'
import { ChevronRight, LucideSquareChevronRight } from 'lucide-react'
import { Divider } from '@/components/divider'

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
    <div className='flex-1 flex h-full flex-col items-center'>
      <div className="w-full h-14">
        <div className='flex h-[calc(100%-1px)] items-center justify-between px-[20px]'>
          <div className='flex gap-1'>
            {character.name}
            <ChevronRight strokeWidth={1} />
          </div>
          <div>
            {/* 채팅 모델 선택 및 추가 기능 토글 버튼  */}
          </div>
        </div>

        <Divider />
      </div>

      <MobileShell>
        <ChatWindow
          character={character}
          conversationId={conversationId}
          initialMessages={initialMessages}
          />
      </MobileShell>
    </div>
  )
}
