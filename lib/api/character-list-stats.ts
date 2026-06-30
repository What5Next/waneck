import {
  getCommentCountsByCharacterIds,
  withCommentCounts,
} from '@/lib/api/character-comment-counts'

type CharacterWithOptionalStats = {
  id: string
  like_count?: number | null
  message_count?: number | null
  comment_count?: number | null
}

/** 목록 API용 — 실제 댓글 수 집계 + count 필드 기본값 보정 */
export async function enrichCharactersWithStats<T extends CharacterWithOptionalStats>(
  characters: T[],
): Promise<T[]> {
  const commentCounts = await getCommentCountsByCharacterIds(
    characters.map((character) => character.id),
  )

  const withComments = withCommentCounts(
    characters.map((character) => ({
      ...character,
      comment_count: character.comment_count ?? undefined,
    })),
    commentCounts,
  )

  return withComments.map((character) => ({
    ...character,
    like_count: character.like_count ?? 0,
    message_count: character.message_count ?? 0,
  })) as T[]
}
