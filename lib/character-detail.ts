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

/** 생성일 표시 (예: Created Jun 25, 2024) */
export function formatCharacterCreatedDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return formatted ? `Created ${formatted}` : ''
}

/** 댓글용 상대 시간 (예: 6d, 2h) */
export function formatRelativeCommentTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Math.max(0, Date.now() - date.getTime())
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) return 'now'
  if (diffMinutes < 60) return `${diffMinutes}m`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks}w`

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
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
