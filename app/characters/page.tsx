'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import type { Character } from '@/lib/types'
import { getCharacterChatCountValue } from '@/lib/character-display'
import { MobileShell } from '@/components/mobile-shell'
import { CharacterSection } from '@/components/character-section'
import { Chip } from '@/components/ui/chip'

const GENRE_FILTERS = ['전체', '로맨스', '판타지', '시뮬레이션', 'GL', 'BL'] as const
const SORT_OPTIONS = [
  { id: 'popular', label: '대화 많이 나눈 순' },
  { id: 'latest', label: '최신순' },
  { id: 'name', label: '이름순' },
] as const

type SortId = (typeof SORT_OPTIONS)[number]['id']

function sortCharacters(characters: Character[], sortId: SortId): Character[] {
  const sorted = [...characters]

  if (sortId === 'latest') {
    return sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  if (sortId === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }

  return sorted.sort(
    (a, b) => getCharacterChatCountValue(b.id) - getCharacterChatCountValue(a.id),
  )
}

function filterByGenre(characters: Character[], genre: string): Character[] {
  if (genre === '전체') return characters

  return characters.filter((character) =>
    character.genres.some((item) => item.toLowerCase() === genre.toLowerCase()),
  )
}

function filterBySearch(characters: Character[], search: string): Character[] {
  const keyword = search.trim().toLowerCase()
  if (!keyword) return characters

  return characters.filter(
    (character) =>
      character.name.toLowerCase().includes(keyword) ||
      character.short_intro?.toLowerCase().includes(keyword) ||
      character.tag?.toLowerCase().includes(keyword),
  )
}

export default function CharactersPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState<string>('전체')
  const [activeSort, setActiveSort] = useState<SortId>('popular')

  useEffect(() => {
    fetch('/api/characters')
      .then((response) => response.json())
      .then((data: Character[]) => {
        if (Array.isArray(data)) setCharacters(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredCharacters = useMemo(() => {
    const byGenre = filterByGenre(characters, activeGenre)
    return filterBySearch(byGenre, searchQuery)
  }, [characters, activeGenre, searchQuery])

  const risingCreators = useMemo(
    () =>
      sortCharacters(filteredCharacters, 'latest').slice(0, 12),
    [filteredCharacters],
  )

  const trendingCharacters = useMemo(
    () => sortCharacters(filteredCharacters, 'popular').slice(0, 10),
    [filteredCharacters],
  )

  const allCharacters = useMemo(
    () => sortCharacters(filteredCharacters, activeSort),
    [filteredCharacters, activeSort],
  )

  return (
    <MobileShell>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <h1 className="sr-only">캐릭터</h1>

        {/* 장르 필터 */}
        <nav
          aria-label="장르 필터"
          className="scroll-hide z-10 flex min-h-14 shrink-0 gap-2 overflow-x-auto bg-background px-4 py-3"
        >
          {GENRE_FILTERS.map((genre) => (
            <Chip
              key={genre}
              selected={activeGenre === genre}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </Chip>
          ))}
        </nav>

        <div className="scroll-hide min-h-0 flex-1 overflow-y-auto pb-8">
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
              <h2 className="text-[15px] font-bold text-foreground">캐릭터 모아보기</h2>
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
              emptyMessage={
                activeGenre === '전체'
                  ? '등록된 캐릭터가 없습니다.'
                  : `${activeGenre} 장르의 캐릭터가 없습니다.`
              }
            />
          </section>
        </div>
      </div>
    </MobileShell>
  )
}
