"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  type BrowseSortTab,
  filterBySearch,
  sortBrowseCharacters,
} from "@/lib/character-browse";
import { CharacterGridCard } from "@/components/character-grid-card";
import {
  CharacterBrowseToolbar,
  type BrowseViewMode,
} from "@/components/characters/character-browse-toolbar";
import { CharacterListCard } from "@/components/characters/character-list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CharacterListCardSkeleton } from "@/components/ui/skeleton";
import { ExplorePageLayout } from "@/components/layout/explore-page-layout";
import { useCharactersQuery } from "@/hooks/queries/use-characters-query";
import { useBrowseViewMode } from "@/hooks/use-user-settings";

export default function CharactersPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  // P2: useEffect fetch 대신 TanStack Query 캐시 사용 (홈과 공유)
  const { data: characters = [], isLoading: loading } = useCharactersQuery();
  const [sortTab, setSortTab] = useState<BrowseSortTab>("relevance");
  // P5: list/grid 뷰 모드 — localStorage 동기화
  const { viewMode, setViewMode } = useBrowseViewMode();

  const filteredCharacters = useMemo(
    () => filterBySearch(characters, searchQuery),
    [characters, searchQuery],
  );

  const sortedCharacters = useMemo(
    () => sortBrowseCharacters(filteredCharacters, sortTab, searchQuery),
    [filteredCharacters, sortTab, searchQuery],
  );

  const emptyMessage = searchQuery
    ? "검색 결과가 없습니다."
    : "등록된 캐릭터가 없습니다.";

  const handleViewModeChange = (mode: BrowseViewMode) => {
    setViewMode(mode);
  };
  console.log("sortedCharacters", characters);
  return (
    <ExplorePageLayout>
      <h1 className="sr-only">캐릭터 탐색</h1>

      <div className="mx-auto my-2 w-full space-y-1 px-3 sm:px-4">
        <CharacterBrowseToolbar
          sortTab={sortTab}
          onSortTabChange={setSortTab}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <CharacterListCardSkeleton key={index} />
            ))}
          </div>
        ) : sortedCharacters.length === 0 ? (
          <EmptyState
            message={emptyMessage}
            className="min-h-[240px] py-12"
            messageClassName="text-sm"
          />
        ) : viewMode === "list" ? (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            {sortedCharacters.map((character) => (
              <div key={character.id} className="min-w-0">
                <CharacterListCard character={character} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 xs:grid-cols-3">
            {sortedCharacters.map((character) => (
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
