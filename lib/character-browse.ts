import { toHomeCategoryLabel } from '@/lib/character-genres'
import type { Character } from '@/lib/types'

export const SORT_OPTIONS = [
  { id: 'popular', label: 'Most chatted' },
  { id: 'latest', label: 'Newest' },
  { id: 'name', label: 'Name' },
] as const

export type CharacterSortId = (typeof SORT_OPTIONS)[number]['id']

function getMessageCount(character: Character): number {
  return character.message_count ?? 0
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

  return sorted.sort((a, b) => getMessageCount(b) - getMessageCount(a))
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

  const targetLabel = toHomeCategoryLabel(category)

  return characters.filter((character) => {
    const genreMatch = character.genres.some(
      (item) => item.toLowerCase() === category.toLowerCase(),
    )
    if (genreMatch) return true

    // genres가 비어 있는 캐릭터가 많아 tag(무드/장르 자유 태그)도 같은 카테고리로 정규화해 매칭
    const tag = character.tag?.trim()
    return !!tag && toHomeCategoryLabel(tag) === targetLabel
  })
}
