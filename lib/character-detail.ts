/** 인트로 프리뷰용 타임스탬프 포맷 (예: 2023. 11. 03. 15:19) */
export function formatIntroTimestamp(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}. ${month}. ${day}. ${hours}:${minutes}`
}

/** genres + tag 병합 후 중복 제거 */
export function getCharacterHashtags(genres: string[], tag: string | null): string[] {
  const hashtags = [
    ...genres.map((genre) => genre.trim()).filter(Boolean),
    ...(tag?.trim() ? [tag.trim()] : []),
  ]

  return [...new Set(hashtags)]
}

/** 상세 설명 본문 (description 우선, 없으면 detail_description) */
export function getCharacterDetailedDescription(
  description: string | null,
  detailDescription: string | null,
): string | null {
  const primary = description?.trim()
  if (primary) return primary

  const fallback = detailDescription?.trim()
  return fallback || null
}
