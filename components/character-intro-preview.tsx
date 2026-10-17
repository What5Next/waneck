import type { Character, CharacterIntroMessage, CharacterSituationImage } from '@/lib/types'
import { MessageBubble } from '@/components/chat/message-bubble'
import { getOpeningImageUrl } from '@/lib/character-opening-image'

interface CharacterIntroPreviewProps {
  character: Character
  introMessages: CharacterIntroMessage[]
  situationImages?: CharacterSituationImage[]
}

function normalizeRole(role: string): 'user' | 'model' {
  return role === 'user' ? 'user' : 'model'
}

export function CharacterIntroPreview({
  character,
  introMessages,
  situationImages,
}: CharacterIntroPreviewProps) {
  if (introMessages.length === 0) return null
  const openingImageUrl = getOpeningImageUrl(situationImages)
  const firstModelIndex = introMessages.findIndex((message) => message.role === 'model')

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[19px] font-bold text-foreground">Intro Preview</h2>
      <div className="flex flex-col gap-3 rounded-[8px] border border-border bg-card/50 px-2.5 py-4">
        {introMessages.map((message, index) => {
          const role = normalizeRole(message.role)
          const previousMessage = index > 0 ? introMessages[index - 1] : undefined
          const isConsecutiveSameRole =
            previousMessage != null && normalizeRole(previousMessage.role) === role
          const showAvatar = role === 'model' && !isConsecutiveSameRole

          return (
            <div key={`${message.sort_order}-${index}`} className="flex flex-col gap-2">
              <MessageBubble
                role={role}
                content={message.content}
                character={character}
                showAvatar={showAvatar}
              />
              {openingImageUrl && index === firstModelIndex ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={openingImageUrl} alt={`${character.name} opening scene`} className="ml-10 max-h-80 max-w-[min(80%,20rem)] rounded-xl object-contain" />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
