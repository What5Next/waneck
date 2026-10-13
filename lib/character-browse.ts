import { CHARACTER_GENRE_OPTIONS, toHomeCategoryLabel } from '@/lib/character-genres'
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

export type HomeCategory = {
  id: string
  label: string
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'for-you', label: 'For You' },
  ...CHARACTER_GENRE_OPTIONS.map((genre) => ({ id: genre, label: genre })),
]

export function filterByHomeCategory(
  characters: Character[],
  category: string,
): Character[] {
  if (category === 'for-you') return characters

  const target = toHomeCategoryLabel(category)

  return characters.filter((character) =>
    character.genres.some((item) => toHomeCategoryLabel(item) === target),
  )
}
