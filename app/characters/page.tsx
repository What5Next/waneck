'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import type { Character } from '@/lib/types'
import {
  type BrowseSortTab,
  filterBySearch,
  sortBrowseCharacters,
} from '@/lib/character-browse'
import { CharacterGridCard } from '@/components/character-grid-card'
import {
  CharacterBrowseToolbar,
  type BrowseViewMode,
} from '@/components/characters/character-browse-toolbar'
import { CharacterListCard } from '@/components/characters/character-list-card'
import { EmptyState } from '@/components/ui/empty-state'
import { ExplorePageLayout } from '@/components/layout/explore-page-layout'

const BROWSE_VIEW_STORAGE_KEY = 'waneck-browse-view'

function readStoredViewMode(): BrowseViewMode {
  if (typeof window === 'undefined') return 'list'
  const stored = window.localStorage.getItem(BROWSE_VIEW_STORAGE_KEY)
  return stored === 'grid' ? 'grid' : 'list'
}

export default function CharactersPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [sortTab, setSortTab] = useState<BrowseSortTab>('relevance')
  const [viewMode, setViewMode] = useState<BrowseViewMode>('list')

  useEffect(() => {
    setViewMode(readStoredViewMode())
  }, [])

  useEffect(() => {
    fetch('/api/characters')
      .then((response) => response.json())
      .then((data: Character[]) => {
        if (Array.isArray(data)) setCharacters(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredCharacters = useMemo(
    () => filterBySearch(characters, searchQuery),
    [characters, searchQuery],
  )

  const sortedCharacters = useMemo(
    () => sortBrowseCharacters(filteredCharacters, sortTab, searchQuery),
    [filteredCharacters, sortTab, searchQuery],
  )

  const emptyMessage = searchQuery
    ? '검색 결과가 없습니다.'
    : '등록된 캐릭터가 없습니다.'

  const handleViewModeChange = (mode: BrowseViewMode) => {
    setViewMode(mode)
    window.localStorage.setItem(BROWSE_VIEW_STORAGE_KEY, mode)
  }

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
                <div
                  key={index}
                  className="h-36 min-w-0 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : sortedCharacters.length === 0 ? (
            <EmptyState
              message={emptyMessage}
              className="min-h-[240px] py-12"
              messageClassName="text-sm"
            />
          ) : viewMode === 'list' ? (
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
  )
}
