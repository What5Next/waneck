"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  HOME_CATEGORIES,
  filterByHomeCategory,
  filterBySearch,
  sortCharacters,
} from "@/lib/character-browse";
import { ExplorePageLayout } from "@/components/layout/explore-page-layout";
import { CharacterSection } from "@/components/character-section";
import { FeaturedCharacterHero } from "@/components/home/featured-character-hero";
import { Chip } from "@/components/ui/chip";
import { FadeEdge } from "@/components/ui/fade-edge";
import { SectionHeader } from "@/components/ui/section-header";
import { HeroBannerSkeleton } from "@/components/ui/skeleton";
import { useCharactersQuery } from "@/hooks/queries/use-characters-query";

/** 카테고리 chip 하단 fade 높이 */
const CHIP_FADE_SIZE = 16;

/** Fisher-Yates 셔플 — 원본 배열은 변경하지 않음 */
function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [activeCategory, setActiveCategory] = useState(HOME_CATEGORIES[0].id);
  // P2: useEffect fetch 대신 TanStack Query 캐시 사용
  const { data: characters = [], isLoading: loading } = useCharactersQuery();

  const filteredCharacters = useMemo(() => {
    const byCategory = filterByHomeCategory(characters, activeCategory);
    return filterBySearch(byCategory, searchQuery);
  }, [characters, activeCategory, searchQuery]);

  const trendingCharacters = useMemo(
    () => sortCharacters(filteredCharacters, "popular").slice(0, 10),
    [filteredCharacters],
  );

  const heroCharacters = useMemo(
    () => sortCharacters(characters, "popular").slice(0, 5),
    [characters],
  );

  const allCharacters = useMemo(
    () => shuffle(filteredCharacters),
    [filteredCharacters],
  );

  return (
    <ExplorePageLayout scrollClassName="pb-2 pt-2">
      <h1 className="sr-only">whatsnext Home</h1>

      {loading ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <HeroBannerSkeleton />
        </div>
      ) : (
        <FeaturedCharacterHero characters={heroCharacters} />
      )}

      <FadeEdge
        bottom
        size={CHIP_FADE_SIZE}
        fadeColor="background"
        className="z-10 mt-8 shrink-0 bg-background"
      >
        <nav
          aria-label="Categories"
          className="scroll-hide flex min-h-14 gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {HOME_CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              selected={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Chip>
          ))}
        </nav>
      </FadeEdge>

      <CharacterSection
        title="Trending Now"
        characters={trendingCharacters}
        loading={loading}
        horizontal
      />

      <section className="mt-8">
        <SectionHeader title="Browse Characters" />

        <CharacterSection
          title=""
          characters={allCharacters}
          loading={loading}
          className="mt-0"
          emptyMessage="No characters yet."
        />
      </section>
    </ExplorePageLayout>
  );
}
