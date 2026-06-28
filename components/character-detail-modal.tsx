"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CharacterRecommendRow } from "@/components/characters/character-recommend-row";
import { CharacterSimilarSection } from "@/components/characters/character-similar-section";
import { ChevronRight, Heart, MessageCircle, MoreVertical } from "lucide-react";

import { CharacterCommentsPanel } from "@/components/characters/character-comments-panel";
import { CharacterLikeButton } from "@/components/characters/character-like-button";
import { StartChatButton } from "@/components/start-chat-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMoreFromCreator } from "@/hooks/queries/use-more-from-creator";
import { formatCompactCount } from "@/lib/character-display";
import {
  formatCharacterCreatedDate,
  getCharacterDetailedDescription,
  getCharacterHashtags,
} from "@/lib/character-detail";
import type { CharacterWithDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

type DetailTab = "about" | "comments";

type CharacterDetailModalProps = {
  character: CharacterWithDetail;
  /** overlay: URL 변경 없이 닫기, route: router.back/push (직접 URL 진입) */
  closeMode?: "overlay" | "route";
  onClose?: () => void;
};

export function CharacterDetailModal({
  character,
  closeMode = "route",
  onClose,
}: CharacterDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DetailTab>("about");

  const { items: moreFromCreator } = useMoreFromCreator(
    character.id,
    character.created_by,
  );

  const hashtags = getCharacterHashtags(character.genres, character.tag);
  const detailedDescription = getCharacterDetailedDescription(
    character.description,
    character.detail_description,
  );
  const creatorName = character.creator?.display_name?.trim() || null;
  const createdDateLabel = formatCharacterCreatedDate(character.created_at);
  const messageCountLabel = formatCompactCount(character.message_count ?? 0);
  const likeCountLabel = formatCompactCount(character.like_count ?? 0);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (closeMode === "overlay") {
        onClose?.();
        return;
      }

      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        return;
      }
      router.push("/characters");
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        showClose
        className={cn(
          "left-1/2 top-1/2 flex h-[min(90dvh,820px)] w-[min(1100px,95vw)] max-w-none -translate-x-1/2 -translate-y-1/2",
          "flex-row gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        )}
      >
        <DialogTitle className="sr-only">{character.name}</DialogTitle>

        <div className="flex min-w-0 flex-[1.85] flex-col border-r border-border">
          <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex gap-4 p-6 pb-4">
              <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-muted">
                {character.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={character.profile_image_url}
                    alt={character.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground/40">
                    {character.name[0]}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  aria-label="Gallery"
                >
                  Gallery
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold leading-tight text-foreground">
                    {character.name}
                  </h1>
                  <div className="flex shrink-0 items-center gap-1">
                    <CharacterLikeButton
                      characterId={character.id}
                      createdBy={character.created_by}
                      isLiked={character.is_liked ?? false}
                    />
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="More options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {messageCountLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {likeCountLabel}
                  </span>
                </div>

                {hashtags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((hashtag) => (
                      <span
                        key={hashtag}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        #{hashtag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {createdDateLabel ? (
                  <p className="text-xs text-muted-foreground">
                    {createdDateLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="px-6 pb-4">
              <StartChatButton characterId={character.id} />
            </div>

            <div className="flex gap-6 border-b border-border px-6">
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={cn(
                  "border-b-2 pb-2.5 text-sm font-semibold transition-colors",
                  activeTab === "about"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={cn(
                  "border-b-2 pb-2.5 text-sm font-semibold transition-colors",
                  activeTab === "comments"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Comments
                {(character.comment_count ?? 0) > 0 ? (
                  <span className="ml-1 text-muted-foreground">
                    ({character.comment_count})
                  </span>
                ) : null}
              </button>
            </div>

            <div className="flex-1 px-6 py-5">
              {activeTab === "about" ? (
                detailedDescription ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {detailedDescription}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No description yet.
                  </p>
                )
              ) : (
                <CharacterCommentsPanel
                  characterId={character.id}
                  enabled={activeTab === "comments"}
                />
              )}
            </div>
          </div>
        </div>

        <aside className="flex w-[min(320px,35%)] shrink-0 flex-col bg-muted/30">
          <div className="scroll-hide flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 pt-14">
            {creatorName ? (
              <section className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-bold text-muted-foreground">
                  {creatorName[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">
                    {creatorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Followers 0 · Following 0
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  disabled
                  className="w-full rounded-lg"
                >
                  Follow
                </Button>
              </section>
            ) : null}

            {creatorName && moreFromCreator.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">
                  More from {creatorName}
                </h2>
                <div className="flex flex-col gap-2">
                  {moreFromCreator.map((item) => (
                    <CharacterRecommendRow
                      key={item.id}
                      characterId={item.id}
                      name={item.name}
                      profileImageUrl={item.profile_image_url}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <CharacterSimilarSection
              characterId={character.id}
              createdBy={character.created_by}
              layout="list"
            />
          </div>
        </aside>
      </DialogContent>
    </Dialog>
  );
}
