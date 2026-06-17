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
import { MobileShell } from '@/components/mobile-shell'

const BROWSE_VIEW_STORAGE_KEY = 'waneck-browse-view'
const AI_SEARCH_STORAGE_KEY = 'waneck-ai-search'

function readStoredViewMode(): BrowseViewMode {
  if (typeof window === 'undefined') return 'list'
  const stored = window.localStorage.getItem(BROWSE_VIEW_STORAGE_KEY)
  return stored === 'grid' ? 'grid' : 'list'
}

function readStoredAiSearch(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(AI_SEARCH_STORAGE_KEY) === 'true'
}

export default function CharactersPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [sortTab, setSortTab] = useState<BrowseSortTab>('relevance')
  const [viewMode, setViewMode] = useState<BrowseViewMode>('list')
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false)

  useEffect(() => {
    setViewMode(readStoredViewMode())
    setAiSearchEnabled(readStoredAiSearch())
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

  const handleAiSearchChange = (enabled: boolean) => {
    setAiSearchEnabled(enabled)
    window.localStorage.setItem(AI_SEARCH_STORAGE_KEY, String(enabled))
  }

  return (
    <MobileShell>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <h1 className="sr-only">캐릭터 탐색</h1>

        <div className="scroll-hide min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto my-2 w-full space-y-1 px-3 sm:px-4">
          <CharacterBrowseToolbar
            aiSearchEnabled={aiSearchEnabled}
            onAiSearchChange={handleAiSearchChange}
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
            <p className="py-12 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
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

          <div className="h-10" />
        </div>
      </div>
    </div>
    </MobileShell>
  )
}
