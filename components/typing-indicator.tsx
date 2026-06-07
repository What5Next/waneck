import type { Character } from '@/lib/types'

export default function TypingIndicator({ character }: { character: Character }) {
  return (
    <div className="flex gap-2 items-end">
      <span className="text-xl w-8 text-center flex-shrink-0">
        {character.profile_image_url
          ? <img src={character.profile_image_url} alt={character.name} className="h-8 w-8 rounded-full object-cover" />
          : character.name[0]}
      </span>
      <div className="flex gap-1.5 items-center px-4 py-3 bg-[#1a1916] border border-white/[.07] rounded-2xl rounded-bl-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] opacity-50 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
