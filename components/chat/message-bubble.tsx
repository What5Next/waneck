import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AssistantMarkdownBody } from './assistant-markdown-body'
import type { Character } from '@/lib/types'

export type MessageBubbleProps = {
  role: 'user' | 'model'
  content: string
  isLoading?: boolean
  character?: Character
  showAvatar?: boolean
}

export function MessageBubble({
  role,
  content,
  isLoading = false,
  character,
  showAvatar = true,
}: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex w-full flex-col items-end gap-1">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[15px] leading-relaxed shadow-sm">
          {content}
        </div>
      </div>
    )
  }

  let body: ReactNode
  if (content.length > 0) {
    body = <AssistantMarkdownBody text={content} />
  } else if (isLoading) {
    body = '…'
  } else {
    body = ''
  }

  return (
    <div className="flex w-full items-start gap-3">
      {showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm">
          <AvatarFallback className="bg-muted text-base">
            {character?.name[0] ?? 'AI'}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-8 w-8 shrink-0" aria-hidden="true" />
      )}
      <div className="flex max-w-[85%] flex-col gap-1">
        {showAvatar && character && (
          <span className="ml-1 text-xs font-medium text-muted-foreground">{character.name}</span>
        )}
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-[15px] leading-relaxed text-foreground',
            isLoading && 'animate-pulse',
          )}
        >
          {body}
        </div>
      </div>
    </div>
  )
}
