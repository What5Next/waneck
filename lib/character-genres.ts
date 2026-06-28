/** 홈 카테고리·캐릭터 생성·유사도 추천 공용 genre 목록 */
export const CHARACTER_GENRE_OPTIONS = [
  '로맨스',
  '판타지',
  '시뮬레이션',
  'GL',
  'BL',
] as const

export type CharacterGenre = (typeof CHARACTER_GENRE_OPTIONS)[number]

const GENRE_SET = new Set<string>(CHARACTER_GENRE_OPTIONS)

/** 허용 genre만 필터·중복 제거 */
export function normalizeCharacterGenres(genres: unknown): string[] {
  if (!Array.isArray(genres)) return []

  const normalized: string[] = []
  for (const genre of genres) {
    if (typeof genre !== 'string') continue
    const trimmed = genre.trim()
    if (!trimmed || !GENRE_SET.has(trimmed)) continue
    if (!normalized.includes(trimmed)) normalized.push(trimmed)
  }

  return normalized
}
