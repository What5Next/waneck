"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  HOME_CATEGORIES,
  filterByHomeCategory,
  filterBySearch,
} from "@/lib/character-browse";
import { CharacterGridCard } from "@/components/character-grid-card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { CharacterCardSkeleton } from "@/components/ui/skeleton";
import { ExplorePageLayout } from "@/components/layout/explore-page-layout";
import { useCharactersQuery } from "@/hooks/queries/use-characters-query";

export default function CharactersPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  // P2: useEffect fetch 대신 TanStack Query 캐시 사용 (홈과 공유)
  const { data: characters = [], isLoading: loading } = useCharactersQuery();
  const [activeCategory, setActiveCategory] = useState(HOME_CATEGORIES[0].id);

  const filteredCharacters = useMemo(() => {
    const byCategory = filterByHomeCategory(characters, activeCategory);
    return filterBySearch(byCategory, searchQuery);
  }, [characters, activeCategory, searchQuery]);

  const emptyMessage = searchQuery
    ? "No search results."
    : "No characters yet.";

  return (
    <ExplorePageLayout>
      <h1 className="sr-only">Explore Characters</h1>

      <div className="mx-auto w-full px-3 sm:px-4">
        <nav
          aria-label="Categories"
          className="scroll-hide mb-4 mt-6 flex gap-2 overflow-x-auto py-1"
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

        {loading ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 xs:grid-cols-3 sm:grid-cols-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <CharacterCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredCharacters.length === 0 ? (
          <EmptyState
            message={emptyMessage}
            className="min-h-[240px] py-12"
            messageClassName="text-sm"
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 xs:grid-cols-3 sm:grid-cols-4">
            {filteredCharacters.map((character) => (
              <div key={character.id} className="min-w-0">
                <CharacterGridCard character={character} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ExplorePageLayout>
  );
}
