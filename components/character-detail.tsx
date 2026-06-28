'use client'

import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'

import { CharacterSimilarSection } from '@/components/characters/character-similar-section'
import { CharacterCommentsPanel } from '@/components/characters/character-comments-panel'
import { CharacterLikeButton } from '@/components/characters/character-like-button'
import { CharacterIntroPreview } from '@/components/character-intro-preview'
import { StartChatButton } from '@/components/start-chat-button'
import { formatCompactCount } from '@/lib/character-display'
import {
  getCharacterDetailedDescription,
  getCharacterHashtags,
} from '@/lib/character-detail'
import type { CharacterWithDetail } from '@/lib/types'
import { cn } from '@/lib/utils'

type DetailTab = 'about' | 'comments'

export function CharacterDetail({
  character,
  onStartChat,
}: {
  character: CharacterWithDetail
  onStartChat?: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('about')

  const hashtags = getCharacterHashtags(character.genres, character.tag)
  const detailedDescription = getCharacterDetailedDescription(
    character.description,
    character.detail_description,
  )
  const creatorName = character.creator?.display_name?.trim() || null

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-background">
      <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="h-[240px] w-full shrink-0 overflow-hidden bg-muted">
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
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-foreground">{character.name}</h1>
              <CharacterLikeButton
                characterId={character.id}
                createdBy={character.created_by}
                isLiked={character.is_liked ?? false}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {formatCompactCount(character.message_count ?? 0)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {formatCompactCount(character.like_count ?? 0)}
              </span>
            </div>

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

          <div className="flex gap-4 border-b border-border">
            {(['about', 'comments'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'border-b-2 pb-2 text-sm font-semibold capitalize transition-colors',
                  activeTab === tab
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'about' ? (
            <>
              {detailedDescription ? (
                <section className="flex flex-col gap-2">
                  <h2 className="text-[15px] font-bold text-foreground">About</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {detailedDescription}
                  </p>
                </section>
              ) : null}

              <CharacterIntroPreview
                character={character}
                introMessages={character.intro_messages}
              />

              <CharacterSimilarSection
                characterId={character.id}
                createdBy={character.created_by}
              />
            </>
          ) : (
            <CharacterCommentsPanel
              characterId={character.id}
              enabled={activeTab === 'comments'}
            />
          )}
        </div>
      </div>

      <div className="shrink-0 rounded-t-2xl border border-b-0 border-border bg-background/95 px-5 py-4 backdrop-blur-sm">
        <StartChatButton characterId={character.id} onSuccess={onStartChat} />
      </div>
    </div>
  )
}
