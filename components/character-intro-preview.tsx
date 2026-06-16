import type { Character, CharacterIntroMessage } from '@/lib/types'
import { formatIntroTimestamp } from '@/lib/character-detail'
import { MessageBubble } from '@/components/chat/message-bubble'

interface CharacterIntroPreviewProps {
  character: Character
  introMessages: CharacterIntroMessage[]
}

function normalizeRole(role: string): 'user' | 'model' {
  return role === 'user' ? 'user' : 'model'
}

export function CharacterIntroPreview({
  character,
  introMessages,
}: CharacterIntroPreviewProps) {
  if (introMessages.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-bold text-foreground">인트로 프리뷰</h2>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/50 p-4">
        {introMessages.map((message, index) => {
          const role = normalizeRole(message.role)
          const previousMessage = index > 0 ? introMessages[index - 1] : undefined
          const isConsecutiveSameRole =
            previousMessage != null && normalizeRole(previousMessage.role) === role
          const showAvatar = role === 'model' && !isConsecutiveSameRole

          return (
            <MessageBubble
              key={`${message.sort_order}-${index}`}
              role={role}
              content={message.content}
              character={character}
              showAvatar={showAvatar}
              timestamp={formatIntroTimestamp(message.created_at)}
            />
          )
        })}
      </div>
    </section>
  )
}
