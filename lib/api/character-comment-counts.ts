import { supabaseAdmin } from '@/lib/supabase.server'

/** 캐릭터 단건 실제 댓글 수 (top-level + 답글) */
export async function getCommentCountForCharacter(
  characterId: string,
): Promise<number | null> {
  const { count, error } = await supabaseAdmin
    .from('character_comments')
    .select('id', { count: 'exact', head: true })
    .eq('character_id', characterId)

  if (error) {
    console.error('[getCommentCountForCharacter]', error)
    return null
  }

  return count ?? 0
}

/** 여러 캐릭터 댓글 수 일괄 집계 */
export async function getCommentCountsByCharacterIds(
  characterIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (characterIds.length === 0) return counts

  const { data, error } = await supabaseAdmin
    .from('character_comments')
    .select('character_id')
    .in('character_id', characterIds)

  if (error) {
    console.error('[getCommentCountsByCharacterIds]', error)
    return counts
  }

  for (const row of data ?? []) {
    counts.set(row.character_id, (counts.get(row.character_id) ?? 0) + 1)
  }

  return counts
}

/** 집계 결과를 캐릭터 목록에 반영 (없으면 0) */
export function withCommentCounts<T extends { id: string; comment_count?: number }>(
  characters: T[],
  counts: Map<string, number>,
): T[] {
  return characters.map((character) => ({
    ...character,
    comment_count: counts.get(character.id) ?? 0,
  }))
}
