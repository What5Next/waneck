import type { Character } from '@/lib/types'
import { Message } from '@/lib/types'

export default function MessageBubble({
  message,
  character,
}: {
  message: Message
  character: Character
}) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 items-end ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <span className="text-xl w-8 text-center flex-shrink-0">
          {character.profile_image_url
            ? <img src={character.profile_image_url} alt={character.name} className="h-8 w-8 rounded-full object-cover" />
            : character.name[0]}
        </span>
      )}
      <div className={`flex flex-col gap-1 max-w-[74%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[#1f2937] text-[#d1d5db] rounded-br-sm'
              : 'bg-[#1a1916] border border-white/[.07] text-[#e8e4dc] rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-[#5a5650] px-1">{message.time}</span>
      </div>
    </div>
  )
}
