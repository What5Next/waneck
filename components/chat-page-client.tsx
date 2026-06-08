'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { MobileShell } from '@/components/mobile-shell'
import { Divider } from '@/components/divider'
import ChatWindow from '@/components/chat-window'
import { ModelSelector, MODELS } from '@/components/chat/model-selector'
import type { ModelId } from '@/components/chat/model-selector'

export function ChatPageClient({
  character,
  conversationId,
  initialMessages,
}: {
  character: Character
  conversationId: string
  initialMessages: Message[]
}) {
  const [model, setModel] = useState<ModelId>(MODELS[0].id)

  return (
    <div className="flex-1 flex h-full flex-col items-center">
      <div className="w-full h-14">
        <div className="flex h-[calc(100%-1px)] items-center justify-between px-[20px]">
          <div className="flex items-center gap-1 text-[15px] font-medium">
            {character.name}
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
          </div>
          <ModelSelector value={model} onChange={setModel} />
        </div>
        <Divider />
      </div>

      <MobileShell>
        <ChatWindow
          character={character}
          conversationId={conversationId}
          initialMessages={initialMessages}
          model={model}
        />
      </MobileShell>
    </div>
  )
}
