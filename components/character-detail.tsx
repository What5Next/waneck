import type { CharacterWithDetail } from '@/lib/types'
import {
  getCharacterDetailedDescription,
  getCharacterHashtags,
} from '@/lib/character-detail'
import { CharacterIntroPreview } from '@/components/character-intro-preview'
import { StartChatButton } from '@/components/start-chat-button'

export function CharacterDetail({ character }: { character: CharacterWithDetail }) {
  const hashtags = getCharacterHashtags(character.genres, character.tag)
  const detailedDescription = getCharacterDetailedDescription(
    character.description,
    character.detail_description,
  )
  const creatorName = character.creator?.display_name?.trim() || null

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* 상단 배너 */}
        <div className="mx-[-20px] h-[220px] shrink-0 overflow-hidden bg-muted">
          {character.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.profile_image_url}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/40">
              {character.name[0]}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 px-[20px] pt-6">
          {/* 메타 */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-foreground">{character.name}</h1>

            {character.short_intro ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {character.short_intro}
              </p>
            ) : null}

            {hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag) => (
                  <span key={hashtag} className="text-sm font-medium text-primary">
                    #{hashtag}
                  </span>
                ))}
              </div>
            ) : null}

            {creatorName ? (
              <p className="text-sm text-muted-foreground">
                Creator · <span className="text-foreground">{creatorName}</span>
              </p>
            ) : null}
          </div>

          {/* 상세 설명 */}
          {detailedDescription ? (
            <section className="flex flex-col gap-2">
              <h2 className="text-[15px] font-bold text-foreground">상세 설명</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {detailedDescription}
              </p>
            </section>
          ) : null}

          {/* 인트로 프리뷰 */}
          <CharacterIntroPreview
            character={character}
            introMessages={character.intro_messages}
          />
        </div>
      </div>

      {/* 하단 고정 CTA — 메인 콘텐츠 영역 안에서만 고정 (사이드바 침범 방지) */}
      <div className="shrink-0 rounded-t-2xl border border-b-0 border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
        <StartChatButton characterId={character.id} />
      </div>
    </div>
  )
}
