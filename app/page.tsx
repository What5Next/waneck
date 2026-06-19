"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Volume2, X } from "lucide-react";

import type { Character } from "@/lib/types";
import {
  SORT_OPTIONS,
  type CharacterSortId,
  filterByHomeCategory,
  filterBySearch,
  sortCharacters,
} from "@/lib/character-browse";
import { ExplorePageLayout } from "@/components/layout/explore-page-layout";
import { CharacterSection } from "@/components/character-section";
import { Chip } from "@/components/ui/chip";
import { FadeEdge } from "@/components/ui/fade-edge";

/** 카테고리 chip 하단 fade 높이 */
const CHIP_FADE_SIZE = 16;

const CATEGORIES = [
  "추천",
  "신규 랭킹",
  "전체 랭킹",
  "오늘 신작",
  "로맨스",
  "판타지",
  "시뮬레이션",
  "GL",
  "BL",
];

export default function Home() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [activeCategory, setActiveCategory] = useState("추천");
  const [activeSort, setActiveSort] = useState<CharacterSortId>("popular");
  const [showNotice, setShowNotice] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/characters")
      .then((response) => response.json())
      .then((data: Character[]) => {
        if (Array.isArray(data)) setCharacters(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCharacters = useMemo(() => {
    const byCategory = filterByHomeCategory(characters, activeCategory);
    return filterBySearch(byCategory, searchQuery);
  }, [characters, activeCategory, searchQuery]);

  const risingCreators = useMemo(
    () => sortCharacters(filteredCharacters, "latest").slice(0, 12),
    [filteredCharacters],
  );

  const trendingCharacters = useMemo(
    () => sortCharacters(filteredCharacters, "popular").slice(0, 10),
    [filteredCharacters],
  );

  const allCharacters = useMemo(
    () => sortCharacters(filteredCharacters, activeSort),
    [filteredCharacters, activeSort],
  );

  return (
    <ExplorePageLayout
      scrollClassName="pb-2 pt-2"
      header={
        <>
          <h1 className="sr-only">와넥 홈</h1>

          <FadeEdge
            bottom
            size={CHIP_FADE_SIZE}
            fadeColor="background"
            className="z-10 shrink-0 bg-background"
          >
            <nav
              aria-label="카테고리"
              className="scroll-hide flex min-h-14 gap-2 overflow-x-auto px-4 py-3"
            >
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Chip>
              ))}
            </nav>
          </FadeEdge>
        </>
      }
    >
          {loading ? (
            <div className="px-4">
              <div className="h-[220px] w-full rounded-2xl bg-muted" />
            </div>
          ) : (
            characters.length > 0 &&
            (() => {
              const featuredCharacter = characters[characters.length - 1];
              return (
                <div
                  className="mx-4 h-[220px] cursor-pointer overflow-hidden rounded-2xl"
                  onClick={() =>
                    router.push(`/characters/${featuredCharacter.id}`)
                  }
                >
                  <div
                    className="relative h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: featuredCharacter.profile_image_url
                        ? `url(${featuredCharacter.profile_image_url})`
                        : undefined,
                      backgroundColor: "#1a1a2e",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[10px]" />
                    <div className="absolute inset-0 flex gap-3 p-4">
                      <div className="flex h-full flex-1 flex-col justify-end gap-1.5 overflow-hidden">
                        <span className="inline-block w-fit rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                          NEW 캐릭터
                        </span>
                        <h2 className="line-clamp-1 text-base font-bold leading-snug text-white">
                          {featuredCharacter.name}
                        </h2>
                        <p className="line-clamp-1 text-[11px] text-white/60">
                          {featuredCharacter.short_intro}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(featuredCharacter.suggestions as string[] | null)
                            ?.slice(0, 2)
                            .map((suggestion, index) => (
                              <span
                                key={index}
                                className="text-[10px] text-white/40"
                              >
                                #{suggestion.replace(/\s+/g, "").slice(0, 6)}
                              </span>
                            ))}
                          {featuredCharacter.tag ? (
                            <span className="text-[10px] text-white/40">
                              #{featuredCharacter.tag}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="mt-1 w-fit rounded-lg border border-white/30 px-3 py-1 text-[11px] text-white hover:bg-white/10"
                        >
                          자세히보기
                        </button>
                      </div>
                      <div className="relative mt-auto aspect-square h-full shrink-0">
                        {featuredCharacter.profile_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={featuredCharacter.profile_image_url}
                            alt={featuredCharacter.name}
                            className="h-full w-full rounded-xl object-cover shadow-lg"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/30 text-3xl">
                            {featuredCharacter.name[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          <div className="mt-3 grid grid-cols-2 gap-2.5 px-4">
            <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-3 py-3">
              <div>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  함께 즐기면,{"\n"}더 재미있는
                </p>
                <p className="mt-0.5 text-sm font-bold text-primary">파티챗</p>
              </div>
              <span className="text-3xl">💬</span>
            </div>
            <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border bg-card px-3 py-3">
              <div>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  오리지널{"\n"}A-RPG
                </p>
                <p className="mt-0.5 text-sm font-bold text-primary">
                  이세계 모험
                </p>
              </div>
              <span className="text-3xl">⚔️</span>
            </div>
          </div>

          <div className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3.5 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <div>
                <p className="text-[13px] font-bold leading-snug text-black">
                  신규 사용자에게만 드리는 대박 혜택
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  미션 완료 시{" "}
                  <span className="font-semibold text-primary">
                    포인트 1000
                  </span>{" "}
                  증정
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          {showNotice ? (
            <div className="mx-4 mt-2.5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-[13px] text-foreground">
                  [업데이트] 내 취향 설정 기능 추가
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                aria-label="닫기"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : null}

          <CharacterSection
            title="떠오르는 신예 창작자들"
            characters={risingCreators}
            loading={loading}
            horizontal
          />

          <CharacterSection
            title="요즘 트렌드"
            characters={trendingCharacters}
            loading={loading}
            showRank
            horizontal
          />

          <section className="mt-8">
            <div className="mb-3 px-4">
              <h2 className="text-[15px] font-bold text-foreground">
                캐릭터 모아보기
              </h2>
            </div>

            <div
              aria-label="정렬"
              className="scroll-hide mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.id}
                  selected={activeSort === option.id}
                  onClick={() => setActiveSort(option.id)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>

            <CharacterSection
              title=""
              characters={allCharacters}
              loading={loading}
              className="mt-0"
              emptyMessage="등록된 캐릭터가 없습니다."
            />
          </section>
    </ExplorePageLayout>
  );
}
