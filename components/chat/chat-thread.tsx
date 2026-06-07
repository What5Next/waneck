'use client'

import { useEffect, useRef } from 'react'

import type { Message } from '@/lib/types'
import type { Character } from '@/lib/characters'
import { MessageBubble } from './message-bubble'

export type ChatThreadProps = {
  messages: Message[]
  isLoading?: boolean
  character: Character
}

export function ChatThread({ messages, isLoading = false, character }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-background p-4">
      {messages.map((m, idx) => {
        const prevMsg = idx > 0 ? messages[idx - 1] : undefined
        const isConsecutiveSameRole = prevMsg?.role === m.role
        const showAvatar = m.role === 'model' && !isConsecutiveSameRole
        return (
          <MessageBubble
            key={m.role + m.time + idx}
            role={m.role}
            content={m.content}
            character={character}
            showAvatar={showAvatar}
          />
        )
      })}
      {isLoading && (
        <MessageBubble role="model" content="" isLoading character={character} showAvatar />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
