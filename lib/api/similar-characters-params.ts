const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** exclude 쿼리 파라미에서 UUID 목록 파싱 (self는 항상 포함) */
export function parseSimilarExcludeIds(
  excludeParam: string | null,
  characterId: string,
): string[] {
  const parsedIds =
    excludeParam
      ?.split(',')
      .map((id) => id.trim())
      .filter((id) => UUID_RE.test(id)) ?? []

  return [...new Set([characterId, ...parsedIds])]
}

/** TanStack Query key용 exclude 직렬화 */
export function buildSimilarExcludeKey(excludeIds: string[]): string {
  return [...new Set(excludeIds)].sort().join(',')
}
