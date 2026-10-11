export type MessageSegment = {
  type: 'narration' | 'dialogue'
  text: string
}

/** 「대사」 구간 — 캐릭터 시트 형식(상황 설명 + 「대사」)에서 쓰인다 */
const BRACKET_DIALOGUE_RE = /(「[^」]*」)/g

/** 「대사」가 들어 있는 메시지: 「…」는 대사, 그 바깥 글은 나레이션 말풍선으로 분리 */
function splitBracketSegments(content: string): MessageSegment[] {
  const segments: MessageSegment[] = []

  for (const part of content.split(BRACKET_DIALOGUE_RE)) {
    if (/^「[^」]*」$/.test(part)) {
      segments.push({ type: 'dialogue', text: part })
      continue
    }

    // 「」 바깥 글은 상황 설명 → 나레이션. *…* 로 감싸져 있어도 같은 취급
    const text = part.replace(/\*/g, '').trim()
    if (text) segments.push({ type: 'narration', text })
  }

  return segments
}

/** *나레이션* 구간과 일반 대사 구간을 순서대로 분리 — 캐릭터가 여러 말풍선으로 나눠 보내도록 */
export function splitMessageSegments(content: string): MessageSegment[] {
  if (/「[^」]*」/.test(content)) return splitBracketSegments(content)

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
