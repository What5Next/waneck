import type { Character } from '@/lib/types'
import { getCharacterChatCountValue } from '@/lib/character-display'

export const SORT_OPTIONS = [
  { id: 'popular', label: 'Most chatted' },
  { id: 'latest', label: 'Newest' },
  { id: 'name', label: 'Name' },
] as const

export type CharacterSortId = (typeof SORT_OPTIONS)[number]['id']

export type BrowseSortTab = 'relevance' | 'chat_count' | 'newest'

export const BROWSE_SORT_TABS: { id: BrowseSortTab; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'chat_count', label: 'Most chatted' },
  { id: 'newest', label: 'Newest' },
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
  if (genre === 'all') return characters

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

// Home category chips → genre filter (ranking/recommend tabs show all)
const HOME_CATEGORY_GENRES = new Set([
  '로맨스',
  '판타지',
  '시뮬레이션',
  'GL',
  'BL',
])

export type HomeCategory = {
  id: string
  label: string
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'for-you', label: 'For You' },
  { id: 'new-ranking', label: 'New Ranking' },
  { id: 'all-ranking', label: 'All Ranking' },
  { id: 'today-new', label: "Today's Picks" },
  { id: '로맨스', label: 'Romance' },
  { id: '판타지', label: 'Fantasy' },
  { id: '시뮬레이션', label: 'Simulation' },
  { id: 'GL', label: 'GL' },
  { id: 'BL', label: 'BL' },
]

export function filterByHomeCategory(
  characters: Character[],
  category: string,
): Character[] {
  if (!HOME_CATEGORY_GENRES.has(category)) return characters
  return filterByGenre(characters, category)
}
