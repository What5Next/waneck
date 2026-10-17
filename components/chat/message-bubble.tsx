'use client'

import type { ReactNode } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserLabel } from '@/hooks/use-user-label'
import { fillTemplateVars } from '@/lib/template-vars'
import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'
import { splitMessageSegments, type MessageSegment } from '@/lib/chat-message-segments'

import { AssistantMarkdownBody } from './assistant-markdown-body'

function renderActions(text: string, actionClassName: string): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g)
  return parts.map((part, index) => {
    const match = part.match(/^\*([^*]+)\*$/)
    if (match) {
      return (
        <span key={index} className={actionClassName}>
          *{match[1]}*
        </span>
      )
    }
    return part
  })
}

export type MessageBubbleProps = {
  role: 'user' | 'model'
  content: string
  isLoading?: boolean
  character?: Pick<Character, 'name' | 'profile_image_url'>
  showAvatar?: boolean
  timestamp?: string
  onCharacterClick?: () => void
}

export function MessageBubble({
  role,
  content,
  isLoading = false,
  character,
  showAvatar = true,
  timestamp,
  onCharacterClick,
}: MessageBubbleProps) {
  const userLabel = useUserLabel()
  content = fillTemplateVars(content, { user: userLabel, char: character?.name })

  if (role === 'user') {
    return (
      <div data-dev-language-ignore className="flex w-full flex-col items-end gap-1">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-[16px] leading-relaxed text-primary-foreground shadow-sm">
          {renderActions(content, 'italic text-primary-foreground/60')}
        </div>
        {timestamp ? (
          <span className="pr-1 text-[11px] text-muted-foreground">{timestamp}</span>
        ) : null}
      </div>
    )
  }

  const segments: MessageSegment[] = content.length > 0 ? splitMessageSegments(content) : []
  const resolvedSegments: MessageSegment[] =
    segments.length > 0
      ? segments
      : content.length > 0
        ? [{ type: 'dialogue', text: content }]
        : []

  const avatar = (
    <Avatar className="h-8 w-8 border border-border shadow-sm">
      <AvatarFallback className="bg-muted text-base">
        {character?.profile_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.profile_image_url} alt={character.name} className="h-full w-full object-cover object-[center_15%]" />
        ) : character?.name[0] ?? 'AI'}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div data-dev-language-ignore className="flex w-full items-start gap-2">
      {showAvatar ? (
        <div className="h-8 w-8 shrink-0">
          {onCharacterClick ? (
            <button type="button" onClick={onCharacterClick} aria-label={`Open ${character?.name ?? 'character'} info`} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{avatar}</button>
          ) : avatar}
        </div>
      ) : (
        <div className="h-8 w-8 shrink-0" aria-hidden="true" />
      )}
      <div className="flex max-w-[85%] flex-col items-start gap-1">
        {showAvatar && character ? (
          onCharacterClick ? <button type="button" onClick={onCharacterClick} className="ml-1 text-sm font-medium text-muted-foreground hover:text-foreground">{character.name}</button> : <span className="ml-1 text-sm font-medium text-muted-foreground">{character.name}</span>
        ) : null}
        {timestamp && showAvatar ? (
          <span className="ml-1 text-[11px] text-muted-foreground">{timestamp}</span>
        ) : null}

        {resolvedSegments.length > 0 ? (
          <div className="flex w-full flex-col items-start gap-2.5">
            {resolvedSegments.map((segment, index) => (
              <div
                key={index}
                className={cn(
                  'w-fit max-w-full rounded-2xl rounded-tl-sm px-4 py-2.5 text-[16px] leading-relaxed',
                  segment.type === 'narration'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-muted text-foreground',
                  isLoading && 'animate-pulse',
                )}
              >
                <AssistantMarkdownBody text={segment.text} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'w-fit max-w-full rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-[16px] leading-relaxed text-foreground',
              isLoading && 'animate-pulse',
            )}
          >
            {isLoading ? '…' : ''}
          </div>
        )}

        {timestamp && !showAvatar ? (
          <span className="ml-1 text-[11px] text-muted-foreground">{timestamp}</span>
        ) : null}
      </div>
    </div>
  )
}
