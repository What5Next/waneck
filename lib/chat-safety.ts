/**
 * 채팅 입력 안전 검사 — 전송 직전에 사용자가 쓴 글을 검사한다.
 * - self_harm: 자살·자해 관련 표현 → 전송하지 않고 위기 지원 정보를 안내한다.
 * - sexual: 성적·19금 표현 → 전송하지 않고 지원하지 않는다고 안내한다.
 *
 * 키워드 기반의 1차 방어선이다. 우회될 수 있으므로 모델/서버 쪽 검사를 대신하지 않는다.
 */

export type SafetyCategory = 'self_harm' | 'sexual'

export type SafetyResult = { ok: true } | { ok: false; category: SafetyCategory }

/** 한국어는 띄어쓰기·구두점을 지운 문자열에서 찾는다 ("죽 고 싶" 같은 우회 방지) */
const KOREAN_SELF_HARM = [
  '자살',
  '자해',
  '죽고싶',
  '죽고십',
  '죽을래',
  '죽어버리',
  '죽어버릴',
  '목숨을끊',
  '목숨끊',
  '스스로목숨',
  '극단적선택',
  '극단적인선택',
  '손목을긋',
  '손목긋',
  '목을매',
  '목매달',
  '투신자살',
  '유서를',
  '생을마감',
  '삶을마감',
  '살기싫',
  '살고싶지않',
  '사라지고싶',
  '번개탄',
]

const KOREAN_SEXUAL = [
  '섹스',
  '성관계',
  '성행위',
  '야동',
  '포르노',
  '자위',
  '오르가즘',
  '음란',
  '나체',
  '알몸',
  '19금',
  '성인물',
  '삽입',
  '펠라',
  '오럴',
  '야한얘기',
  '야한이야기',
  '야한장면',
  '벗겨',
  '빨아줘',
  '만져줘',
  '가슴을만',
  '하룻밤을보내',
]

/** 영어는 단어 경계를 지켜서 찾는다 ("assess" 안의 "sex" 같은 오탐 방지) */
const ENGLISH_SELF_HARM = [
  /\bsuicid(e|al)\b/i,
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bend(ing)?\s+my\s+(own\s+)?life\b/i,
  /\btake\s+my\s+own\s+life\b/i,
  /\b(want|wanna|going)\s+to\s+die\b/i,
  /\bwanna\s+die\b/i,
  /\bself[\s-]?harm\b/i,
  /\bcut(ting)?\s+my\s*self\b/i,
  /\bhang(ing)?\s+my\s*self\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\b(do\s+not|don't|dont)\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\boverdose\s+on\s+purpose\b/i,
]

const ENGLISH_SEXUAL = [
  /\bsex(ual(ly)?)?\b/i,
  /\bsext(ing)?\b/i,
  /\bporn(o|ography)?\b/i,
  /\bnsfw\b/i,
  /\bnude(s)?\b/i,
  /\bnaked\b/i,
  /\berotic\b/i,
  /\borgasm\b/i,
  /\bmasturbat\w*/i,
  /\b(blow|hand)\s?job\b/i,
  /\b(penis|vagina|genitals?)\b/i,
  /\bintercourse\b/i,
  /\bhorny\b/i,
  /\bmake\s+love\b/i,
]

function compactKorean(text: string): string {
  return text.toLowerCase().replace(/[\s.,!?~*"'`\-_·…「」『』()[\]{}]+/g, '')
}

/** 메시지가 전송 가능한지 검사한다. 자해 표현이 성적 표현보다 우선한다. */
export function checkMessageSafety(text: string): SafetyResult {
  const compact = compactKorean(text)

  if (
    KOREAN_SELF_HARM.some((term) => compact.includes(term)) ||
    ENGLISH_SELF_HARM.some((pattern) => pattern.test(text))
  ) {
    return { ok: false, category: 'self_harm' }
  }

  if (
    KOREAN_SEXUAL.some((term) => compact.includes(term)) ||
    ENGLISH_SEXUAL.some((pattern) => pattern.test(text))
  ) {
    return { ok: false, category: 'sexual' }
  }

  return { ok: true }
}

/** 채팅 안에 시스템 메시지로 보여줄 안내 문구 */
export const SAFETY_NOTICES: Record<SafetyCategory, string> = {
  self_harm:
    "It sounds like you may be going through something painful. You don't have to face it alone. " +
    'If you or someone else may be in danger, please contact local emergency services or a crisis line: ' +
    'Korea 109 (suicide prevention, 24h) · US 988 · findahelpline.com for other countries. ' +
    'AI characters cannot replace people you trust or trained professionals.',
  sexual:
    "This message wasn't sent. whatsnext doesn't support sexually explicit (19+) content. " +
    'Please rephrase it.',
}
