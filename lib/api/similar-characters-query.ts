/** similar API Supabase 쿼리 exclude 필터 */
export function applySimilarExcludeFilter<
  T extends {
    neq: (column: string, value: string) => T
    not: (column: string, operator: string, value: string) => T
  },
>(query: T, excludeIds: string[], characterId: string): T {
  const otherExcludeIds = excludeIds.filter((id) => id !== characterId)

  if (otherExcludeIds.length === 0) {
    return query.neq('id', characterId)
  }

  return query.not('id', 'in', `(${excludeIds.join(',')})`)
}
