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

/** 홈 카테고리 영어 라벨 (표시용) */
export const HOME_CATEGORY_LABELS = {
  로맨스: 'Romance',
  판타지: 'Fantasy',
  시뮬레이션: 'Simulation',
  GL: 'GL',
  BL: 'BL',
} as const satisfies Record<CharacterGenre, string>

/** 홈 카테고리와 무관한 자유 태그(무드·말투 등)를 가장 가까운 카테고리로 매핑 */
const FALLBACK_CATEGORY_MAP: Record<string, string> = {
  romance: 'Romance',
  emotional: 'Romance',
  fantasy: 'Fantasy',
  simulation: 'Simulation',
  humor: 'Simulation',
  유머: 'Simulation',
  direct: 'Simulation',
  gl: 'GL',
  bl: 'BL',
}

/** 캐릭터의 genre/tag 원문(한글·영문 혼용)을 홈 카테고리 영어 라벨로 정규화 */
export function toHomeCategoryLabel(rawLabel: string): string {
  const trimmed = rawLabel.trim()
  const key = trimmed as CharacterGenre
  if (key in HOME_CATEGORY_LABELS) return HOME_CATEGORY_LABELS[key]

  const lower = trimmed.toLowerCase()
  return FALLBACK_CATEGORY_MAP[lower] ?? 'Simulation'
}
