/**
 * 캐릭터 카테고리 — 직업이 아니라 분위기·관계 구도 기준이고, 한 캐릭터가 여러 개에 속할 수 있다.
 * characters.genres 에 이 값 그대로(영문 라벨) 저장한다.
 */
export const CHARACTER_GENRE_OPTIONS = [
  'Fantasy',
  'Dangerous',
  'Cold & Aloof',
  'Gentle',
  'Possessive',
  'Playful',
  'Forced Proximity',
  'Slow Burn',
  'Healing',
] as const

export type CharacterGenre = (typeof CHARACTER_GENRE_OPTIONS)[number]

const GENRE_BY_LOWER = new Map<string, CharacterGenre>(
  CHARACTER_GENRE_OPTIONS.map((genre) => [genre.toLowerCase(), genre]),
)

/** 허용 카테고리만 필터·중복 제거 (대소문자 무시, 표준 표기로 정규화) */
export function normalizeCharacterGenres(genres: unknown): string[] {
  if (!Array.isArray(genres)) return []

  const normalized: string[] = []
  for (const genre of genres) {
    if (typeof genre !== 'string') continue
    const canonical = GENRE_BY_LOWER.get(genre.trim().toLowerCase())
    if (canonical && !normalized.includes(canonical)) normalized.push(canonical)
  }

  return normalized
}

/** 홈 카테고리 표시 라벨 — 카테고리 값이 곧 라벨이다 */
export const HOME_CATEGORY_LABELS = Object.fromEntries(
  CHARACTER_GENRE_OPTIONS.map((genre) => [genre, genre]),
) as Record<CharacterGenre, string>

/** 카테고리 개편 전 값 → 새 라벨 (DB 가 아직 옛 값일 때를 위한 호환) */
const LEGACY_LABELS: Record<string, string> = {
  로맨스: 'Romance',
  판타지: 'Fantasy',
}

/** 카테고리 원문을 표시 라벨로 정규화. 알 수 없는 값(옛 태그 등)은 그대로 돌려준다 */
export function toHomeCategoryLabel(rawLabel: string): string {
  const trimmed = rawLabel.trim()
  return (
    GENRE_BY_LOWER.get(trimmed.toLowerCase()) ?? LEGACY_LABELS[trimmed] ?? trimmed
  )
}
