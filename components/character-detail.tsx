"use client";

import { useMemo, useState } from "react";

import { CharacterSimilarSection } from "@/components/characters/character-similar-section";
import { CharacterCommentsPanel } from "@/components/characters/character-comments-panel";
import { CharacterLikeButton } from "@/components/characters/character-like-button";
import { CharacterThumbnailCard } from "@/components/characters/character-thumbnail-card";
import { CharacterIntroPreview } from "@/components/character-intro-preview";
import { StartChatButton } from "@/components/start-chat-button";
import { useCharacterCommentsQuery } from "@/hooks/queries/use-character-comments-query";
import { useCharacterQuery } from "@/hooks/queries/use-character-query";
import { countCommentsInTree } from "@/lib/character-comments-tree";
import {
  getCharacterDetailedDescription,
  getCharacterHashtags,
} from "@/lib/character-detail";
import type { CharacterWithDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

type DetailTab = "about" | "comments";

type CharacterDetailProps = {
  character: CharacterWithDetail;
  /** 채팅 시작 직전 호출 (예: 모달 닫기) */
  onBeforeNavigate?: () => void;
};

function getCreatorHandle(character: CharacterWithDetail): string | null {
  const tag = character.tag?.trim();
  if (tag) return `@${tag}`;

  const displayName = character.creator?.display_name?.trim();
  if (!displayName) return null;

  return `@${displayName.replace(/\s+/g, "_").toLowerCase()}`;
}

export function CharacterDetail({
  character,
  onBeforeNavigate,
}: CharacterDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("about");
  const { data: liveCharacter } = useCharacterQuery(character.id);
  const { data: comments } = useCharacterCommentsQuery(character.id);

  const characterData = liveCharacter ?? character;

  // 서버 집계 + 로드된 댓글 트리 중 큰 값 (캐시·DB 불일치 방지)
  const commentCount = useMemo(() => {
    const serverCount = characterData.comment_count ?? 0;
    if (!comments) return serverCount;
    return Math.max(serverCount, countCommentsInTree(comments));
  }, [characterData.comment_count, comments]);

  const hashtags = getCharacterHashtags(
    characterData.genres,
    characterData.tag,
  );
  const detailedDescription = getCharacterDetailedDescription(
    characterData.description,
    characterData.detail_description,
  );
  const creatorHandle = getCreatorHandle(characterData);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="scroll-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4 pt-3">
        <CharacterThumbnailCard
          imageUrl={characterData.profile_image_url}
          name={characterData.name}
          messageCount={characterData.message_count ?? 0}
          likeCount={characterData.like_count ?? 0}
          commentCount={commentCount}
          className="mx-auto max-w-[min(100%,55dvh)] rounded-2xl"
        />

        {/* 제목 · 크리에이터 · 좋아요 */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-2">
            <h1 className="text-lg font-bold leading-tight text-foreground">
              {characterData.name}
            </h1>
            {creatorHandle ? (
              <span className="inline-flex w-fit rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {creatorHandle}
              </span>
            ) : null}
          </div>
          <CharacterLikeButton
            characterId={characterData.id}
            createdBy={characterData.created_by}
            isLiked={characterData.is_liked ?? false}
          />
        </div>

        {characterData.short_intro ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {characterData.short_intro}
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

        <div className="flex gap-4 border-b border-border">
          {(["about", "comments"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-2 text-sm font-semibold capitalize transition-colors",
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {tab}
              {tab === "comments" && commentCount > 0 ? (
                <span className="ml-1 text-muted-foreground">
                  ({commentCount})
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 pb-2 pt-1">
          {activeTab === "about" ? (
            <>
              {detailedDescription ? (
                <section className="flex flex-col gap-2">
                  <h3 className="text-[15px] font-bold text-foreground">
                    About
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {detailedDescription}
                  </p>
                </section>
              ) : null}

              <CharacterIntroPreview
                character={characterData}
                introMessages={characterData.intro_messages}
              />

              <CharacterSimilarSection
                characterId={characterData.id}
                createdBy={characterData.created_by}
                layout="horizontal"
              />
            </>
          ) : (
            <CharacterCommentsPanel
              characterId={characterData.id}
              enabled={activeTab === "comments"}
            />
          )}
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
