import type { Character } from '@/lib/types'

/** 유사도 계산에 필요한 최소 필드 */
export type CharacterSimilarityFields = Pick<
  Character,
  'id' | 'genres' | 'tag' | 'mood' | 'message_count'
>

export type RankSimilarCharactersOptions = {
  limit: number
  /** 제외할 캐릭터 ID (자기 자신, moreFromCreator 등) */
  excludeIds?: string[]
}

const TAG_MATCH_SCORE = 40
const GENRE_OVERLAP_SCORE = 10
const MOOD_MATCH_SCORE = 15

/** 비교용 문자열 정규화 */
function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

/** genre 배열 교집합 개수 */
function countGenreOverlap(sourceGenres: string[], candidateGenres: string[]): number {
  if (sourceGenres.length === 0 || candidateGenres.length === 0) return 0

  const normalizedCandidateGenres = new Set(
    candidateGenres.map((genre) => normalizeText(genre)).filter(Boolean),
  )

  return sourceGenres.reduce((count, genre) => {
    const normalizedGenre = normalizeText(genre)
    return normalizedGenre && normalizedCandidateGenres.has(normalizedGenre)
      ? count + 1
      : count
  }, 0)
}

/** source 대비 candidate 유사도 점수 */
export function getCharacterSimilarityScore(
  source: CharacterSimilarityFields,
  candidate: CharacterSimilarityFields,
): number {
  if (source.id === candidate.id) return -1

  let score = 0

  const sourceTag = normalizeText(source.tag)
  const candidateTag = normalizeText(candidate.tag)
  if (sourceTag && candidateTag && sourceTag === candidateTag) {
    score += TAG_MATCH_SCORE
  }

  score += countGenreOverlap(source.genres ?? [], candidate.genres ?? []) * GENRE_OVERLAP_SCORE

  const sourceMood = normalizeText(source.mood)
  const candidateMood = normalizeText(candidate.mood)
  if (sourceMood && candidateMood && sourceMood === candidateMood) {
    score += MOOD_MATCH_SCORE
  }

  return score
}

function getMessageCount(character: CharacterSimilarityFields): number {
  return character.message_count ?? 0
}

/** 후보 목록을 점수순으로 정렬해 상위 limit개 반환 */
export function rankSimilarCharacters<T extends CharacterSimilarityFields>(
  source: CharacterSimilarityFields,
  candidates: T[],
  { limit, excludeIds = [] }: RankSimilarCharactersOptions,
): T[] {
  const excludeSet = new Set(excludeIds)

  return [...candidates]
    .filter((candidate) => candidate.id !== source.id && !excludeSet.has(candidate.id))
    .sort((a, b) => {
      const scoreDiff =
        getCharacterSimilarityScore(source, b) - getCharacterSimilarityScore(source, a)
      if (scoreDiff !== 0) return scoreDiff
      return getMessageCount(b) - getMessageCount(a)
    })
    .slice(0, limit)
}
