/** 숫자 compact 포맷 (1K, 10K 등) */
export function formatCompactCount(value: number): string {
  if (value >= 10000) {
    const thousands = value / 1000
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`
  }
  if (value >= 1000) {
    const thousands = value / 1000
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`
  }
  return String(value)
}

/** UI용 이미지 수 (실제 통계 연동 전) */
export function getCharacterImageCountValue(characterId: string): number {
  let hash = 0
  for (const char of characterId) {
    hash = (hash * 13 + char.charCodeAt(0)) >>> 0
  }
  return (hash % 100) + 1
}
