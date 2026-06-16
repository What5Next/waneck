'use client'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { ChatHeader } from '@/components/chat/chat-header'
import { MobileShell } from '@/components/mobile-shell'
import ChatWindow from '@/components/chat-window'

export function ChatPageClient({
  character,
  conversationId,
  initialMessages,
}: {
  character: Character
  conversationId: string
  initialMessages: Message[]
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader characterId={character.id} characterName={character.name} />

      <div className="flex min-h-0 flex-1 w-full justify-center">
        <MobileShell>
          <ChatWindow
            character={character}
            conversationId={conversationId}
            initialMessages={initialMessages}
          />
        </MobileShell>
      </div>
    </div>
  )
}
