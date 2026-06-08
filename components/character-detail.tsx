import type { Character } from '@/lib/types'
import { StartChatButton } from '@/components/start-chat-button'
import { Divider } from './divider'

export function CharacterDetail({ character }: { character: Character }) {
  return (
    <div className="relative flex h-full flex-col gap-8 bg-background px-[20px] pt-[40px] pb-[100px]">
      <div className='flex flex-col items-center gap-8 sm:flex-row sm:items-stretch'>
        {/* 히어로 영역 */}
        <div className="relative w-[300px] aspect-square rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex h-full w-full items-center justify-center bg-card">
            {character.profile_image_url
              ? <img src={character.profile_image_url} alt={character.name} className="h-full w-full object-cover" />
              : <div className="h-full w-full bg-muted" />}
          </div>
        </div>

        <div className='flex-1 flex flex-col w-full items-start justify-between gap-4'>
          <div className='flex flex-col w-full gap-4'>
            <h1 className="text-2xl font-bold dark:text-white">{character.name}</h1>

            <div className='flex flex-col gap-2'>
              <p className="mt-1 text-sm dark:text-white/80">{character.short_intro}</p>

              {/* 태그 */}
              {character.tag && (
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">
                    {character.tag}
                  </span>
                </div>
              )}
            </div>
          </div>

          <StartChatButton characterId={character.id} />
        </div>

      </div>

      <Divider />

      {/* 본문 */}
      <div className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-4">

        {/* 소개 */}
        <section>
          <h2 className="mb-2 text-sm font-medium text-foreground/90">상세 설명</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {character.description}
          </p>
        </section>

      </div>
    </div>
  )
}
