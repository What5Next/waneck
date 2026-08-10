export type MessageSegment = {
  type: 'narration' | 'dialogue'
  text: string
}

/** *나레이션* 구간과 일반 대사 구간을 순서대로 분리 — 캐릭터가 여러 말풍선으로 나눠 보내도록 */
export function splitMessageSegments(content: string): MessageSegment[] {
  const parts = content.split(/(\*[^*]+\*)/g)
  const segments: MessageSegment[] = []

  for (const part of parts) {
    const narrationMatch = part.match(/^\*([^*]+)\*$/)
    if (narrationMatch) {
      const text = narrationMatch[1].trim()
      if (text) segments.push({ type: 'narration', text })
      continue
    }

    const text = part.trim()
    if (text) segments.push({ type: 'dialogue', text })
  }

  return segments
}
