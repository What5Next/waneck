import type { Character } from '@/lib/types'
import { getCharacterChatCountValue } from '@/lib/character-display'

export const SORT_OPTIONS = [
  { id: 'popular', label: '대화 많이 나눈 순' },
  { id: 'latest', label: '최신순' },
  { id: 'name', label: '이름순' },
] as const

export type CharacterSortId = (typeof SORT_OPTIONS)[number]['id']

export type BrowseSortTab = 'relevance' | 'chat_count' | 'newest'

export const BROWSE_SORT_TABS: { id: BrowseSortTab; label: string }[] = [
  { id: 'relevance', label: '관련도' },
  { id: 'chat_count', label: '대화순' },
  { id: 'newest', label: '최신순' },
]

function getSearchRelevanceScore(character: Character, keyword: string): number {
  const lowerKeyword = keyword.toLowerCase()
  const name = character.name.toLowerCase()
  const intro = character.short_intro?.toLowerCase() ?? ''
  const tag = character.tag?.toLowerCase() ?? ''

  if (name === lowerKeyword) return 100
  if (name.startsWith(lowerKeyword)) return 80
  if (name.includes(lowerKeyword)) return 60
  if (tag.includes(lowerKeyword)) return 40
  if (intro.includes(lowerKeyword)) return 20
  return 0
}

export function sortBrowseCharacters(
  characters: Character[],
  sortTab: BrowseSortTab,
  searchQuery: string,
): Character[] {
  const sorted = [...characters]
  const keyword = searchQuery.trim()

  if (sortTab === 'newest') {
    return sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  if (sortTab === 'chat_count') {
    return sorted.sort(
      (a, b) => getCharacterChatCountValue(b.id) - getCharacterChatCountValue(a.id),
    )
  }

  if (keyword) {
    return sorted.sort((a, b) => {
      const scoreDiff =
        getSearchRelevanceScore(b, keyword) - getSearchRelevanceScore(a, keyword)
      if (scoreDiff !== 0) return scoreDiff
      return getCharacterChatCountValue(b.id) - getCharacterChatCountValue(a.id)
    })
  }

  return sorted.sort(
    (a, b) => getCharacterChatCountValue(b.id) - getCharacterChatCountValue(a.id),
  )
}

export function sortCharacters(
  characters: Character[],
  sortId: CharacterSortId,
): Character[] {
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

export function filterByGenre(characters: Character[], genre: string): Character[] {
  if (genre === '전체') return characters

  return characters.filter((character) =>
    character.genres.some((item) => item.toLowerCase() === genre.toLowerCase()),
  )
}

export function filterBySearch(characters: Character[], search: string): Character[] {
  const keyword = search.trim().toLowerCase()
  if (!keyword) return characters

  return characters.filter(
    (character) =>
      character.name.toLowerCase().includes(keyword) ||
      character.short_intro?.toLowerCase().includes(keyword) ||
      character.tag?.toLowerCase().includes(keyword),
  )
}

// 홈 카테고리 칩 → 장르 필터 (랭킹·추천 탭은 전체 표시)
const HOME_CATEGORY_GENRES = new Set([
  '로맨스',
  '판타지',
  '시뮬레이션',
  'GL',
  'BL',
])

export function filterByHomeCategory(
  characters: Character[],
  category: string,
): Character[] {
  if (!HOME_CATEGORY_GENRES.has(category)) return characters
  return filterByGenre(characters, category)
}
