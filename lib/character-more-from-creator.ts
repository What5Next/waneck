import type { Character } from '@/lib/types'

const MORE_FROM_CREATOR_LIMIT = 3

/** 동일 크리에이터의 다른 캐릭터 (moreFromCreator) */
export function getMoreFromCreator(
  allCharacters: Character[],
  characterId: string,
  createdBy: string | null,
  limit = MORE_FROM_CREATOR_LIMIT,
): Character[] {
  if (!createdBy) return []

  return allCharacters
    .filter((item) => item.created_by === createdBy && item.id !== characterId)
    .slice(0, limit)
}

/** moreFromCreator ID 목록 — similar exclude용 */
export function getMoreFromCreatorExcludeIds(
  allCharacters: Character[],
  characterId: string,
  createdBy: string | null,
): string[] {
  return getMoreFromCreator(allCharacters, characterId, createdBy).map((item) => item.id)
}
