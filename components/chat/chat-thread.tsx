'use client'

import { useEffect, useRef } from 'react'

import type { Message } from '@/lib/types'
import type { Character, CharacterSituationImage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MessageBubble } from './message-bubble'
import { SuggestedReplies, type SuggestedReply } from './suggested-replies'

/** 채팅 안에 끼워 넣는 시스템 안내 — 서버로 보내지 않는 화면 전용 메시지 */
export type ChatSystemNotice = {
  id: string
  /** 이 인덱스의 메시지 바로 뒤에 표시 (-1 이면 맨 앞) */
  afterIndex: number
  text: string
}

export type ChatThreadProps = {
  messages: Message[]
  notices?: ChatSystemNotice[]
  isLoading?: boolean
  character: Character
  situationImages?: CharacterSituationImage[]
  suggestedReplies?: SuggestedReply[]
  onSelectSuggestedReply?: (item: SuggestedReply) => void
}

export function ChatThread({
  messages,
  notices = [],
  isLoading = false,
  character,
  situationImages = [],
  suggestedReplies = [],
  onSelectSuggestedReply,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, notices, isLoading, suggestedReplies])

  function noticesAfter(index: number) {
    return notices
      .filter((notice) => notice.afterIndex === index)
      .map((notice) => (
        <div
          key={notice.id}
          role="status"
          className="mx-auto mt-3 max-w-[85%] rounded-xl bg-muted/60 px-4 py-2.5 text-center text-xs leading-relaxed text-muted-foreground"
        >
          {notice.text}
        </div>
      ))
  }

  return (
    <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto bg-background p-4">
      <div className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col gap-2">
        {noticesAfter(-1)}
        {messages.map((m, idx) => {
          const prevMsg = idx > 0 ? messages[idx - 1] : undefined
          const isConsecutiveSameRole = prevMsg?.role === m.role
          const showAvatar = m.role === 'model' && !isConsecutiveSameRole
          const situationImage = !(isLoading && idx === messages.length - 1)
            ? situationImages.find((image) => image.label?.trim() && m.content.toLocaleLowerCase().includes(image.label.trim().toLocaleLowerCase()))
            : undefined
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
              {situationImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={situationImage.image_url} alt={situationImage.label ?? ''}
                  className="mt-2 ml-10 max-h-80 max-w-[min(80%,20rem)] rounded-xl object-contain" />
              ) : null}
              {noticesAfter(idx)}
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
