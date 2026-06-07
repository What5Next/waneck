import type { Character } from '@/lib/characters'

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl">
        {character.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-zinc-100">{character.name}</p>
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-widest text-zinc-500">
            {character.tag}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-zinc-400">{character.desc}</p>
      </div>
      <span className="text-zinc-600 transition-colors group-hover:text-zinc-400">›</span>
    </div>
  )
}
