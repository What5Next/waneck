"use client";

import { Heart, MessageSquare, MessagesSquare } from "lucide-react";

import { CharacterSimilarSection } from "@/components/characters/character-similar-section";
import { CharacterCommentsPanel } from "@/components/characters/character-comments-panel";
import { CharacterLikeButton } from "@/components/characters/character-like-button";
import { CharacterThumbnailCard } from "@/components/characters/character-thumbnail-card";
import { CharacterIntroPreview } from "@/components/character-intro-preview";
import { StartChatButton } from "@/components/start-chat-button";
import { useCharacterQuery } from "@/hooks/queries/use-character-query";
import { formatCompactCount } from "@/lib/character-display";
import {
  getCharacterDetailedDescription,
  getCharacterHashtags,
} from "@/lib/character-detail";
import { CHARACTER_CREATOR_LABEL } from "@/lib/site-config";
import type { CharacterWithDetail } from "@/lib/types";

type CharacterDetailProps = {
  character: CharacterWithDetail;
  /** 채팅 시작 직전 호출 (예: 모달 닫기) */
  onBeforeNavigate?: () => void;
};

export function CharacterDetail({
  character,
  onBeforeNavigate,
}: CharacterDetailProps) {
  const { data: liveCharacter } = useCharacterQuery(character.id);

  const characterData = liveCharacter ?? character;

  const hashtags = getCharacterHashtags(
    characterData.genres,
    characterData.tag,
  );
  const detailedDescription = getCharacterDetailedDescription(
    characterData.description,
    characterData.detail_description,
  );
  const creatorHandle = `@${CHARACTER_CREATOR_LABEL}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="scroll-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-1">
        <CharacterThumbnailCard
          imageUrl={characterData.profile_image_url}
          name={characterData.name}
          showStats={false}
          className="mx-auto max-w-[min(100%,55dvh)] rounded-2xl"
        >
          <CharacterLikeButton
            characterId={characterData.id}
            createdBy={characterData.created_by}
            isLiked={characterData.is_liked ?? false}
            className="absolute bottom-3 right-3 z-2 h-9 w-9 bg-black/55 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white"
          />
        </CharacterThumbnailCard>

        {/* 제목 · 크리에이터 · 설명 · 대화수 · 태그 */}
        <div className="-mt-2 flex flex-col">
          <h1 className="text-lg font-bold leading-tight text-foreground">
            {characterData.name}
          </h1>
          <span className="mt-1 inline-flex w-fit text-xs text-muted-foreground">
            {creatorHandle}
          </span>
          {characterData.short_intro ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {characterData.short_intro}
            </p>
          ) : null}
          <span className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MessagesSquare className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
              {formatCompactCount(characterData.message_count ?? 0)}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
              {formatCompactCount(characterData.like_count ?? 0)}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
              {formatCompactCount(characterData.comment_count ?? 0)}
            </span>
          </span>
          {hashtags.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {hashtags.map((hashtag) => (
                <span
                  key={hashtag}
                  className="inline-flex items-center rounded-[4px] bg-white/5 px-2.5 py-1.5 text-sm font-medium text-primary"
                >
                  #{hashtag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="my-2 border-t border-white/5" />

        <div className="flex flex-col gap-6 pb-2 pt-1">
          {detailedDescription ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-[19px] font-bold text-foreground">
                About
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {detailedDescription}
              </p>
            </section>
          ) : null}

          <div className="my-2 border-t border-white/5" />

          <CharacterIntroPreview
            character={characterData}
            introMessages={characterData.intro_messages}
          />

          <div className="my-2 border-t border-white/5" />

          <CharacterCommentsPanel characterId={characterData.id} />

          <div className="my-2 border-t border-white/5" />

          <CharacterSimilarSection
            characterId={characterData.id}
            createdBy={characterData.created_by}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3">
        <StartChatButton
          characterId={characterData.id}
          onBeforeNavigate={onBeforeNavigate}
        />
      </div>
    </div>
  );
}
