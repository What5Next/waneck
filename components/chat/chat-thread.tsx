'use client'

import { useEffect, useRef } from 'react'

import type { Message } from '@/lib/types'
import type { Character } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageBubble } from './message-bubble'
import { SuggestedReplies, type SuggestedReply } from './suggested-replies'

export type ChatThreadProps = {
  messages: Message[]
  isLoading?: boolean
  character: Character
  suggestedReplies?: SuggestedReply[]
  onSelectSuggestedReply?: (item: SuggestedReply) => void
}

export function ChatThread({
  messages,
  isLoading = false,
  character,
  suggestedReplies = [],
  onSelectSuggestedReply,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, suggestedReplies])

  return (
    <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto bg-background p-4">
      <div className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col gap-2">
        {messages.map((m, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : undefined
          const isConsecutiveSameRole = prevMsg?.role === m.role
          const showAvatar = m.role === 'model' && !isConsecutiveSameRole
          return (
            <div
              key={m.role + m.time + idx}
              className={cn(!isConsecutiveSameRole && idx > 0 && 'mt-3')}
            >
              <MessageBubble
                role={m.role}
                content={m.content}
                character={character}
                showAvatar={showAvatar}
              />
            </div>
          )
        })}
        {isLoading && (
          <MessageBubble role="model" content="" isLoading character={character} showAvatar />
        )}
        {suggestedReplies.length > 0 && onSelectSuggestedReply ? (
          <SuggestedReplies items={suggestedReplies} onSelect={onSelectSuggestedReply} />
        ) : null}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
