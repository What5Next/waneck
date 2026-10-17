/**
 * 채팅 입력 안전 검사 — 전송 직전에 사용자가 쓴 글을 검사한다.
 * - self_harm: 자살·자해 관련 표현 → 전송하지 않고 위기 지원 정보를 안내한다.
 * - sexual: 성적·19금 표현 → 전송하지 않고 지원하지 않는다고 안내한다.
 * - violence: 잔혹한 폭력 또는 직접적인 위해 요청 → 전송하지 않는다.
 *
 * 키워드 기반의 1차 방어선이다. 우회될 수 있으므로 모델/서버 쪽 검사를 대신하지 않는다.
 */

export type SafetyCategory = 'self_harm' | 'sexual' | 'violence'

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
  '뒤지고싶',
  '디지고싶',
  '죽었으면',
  '죽구싶',
  '죽꼬싶',
  '극단선택',
  '유서쓰',
  '유서썼',
  '유서남',
  '없어지고싶',
  '사는게싫',
  '사는의미없',
  '사는의미가없',
  '투신할',
  '리스트컷',
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
  '야스',
  '섹트',
  '섹파',
  '원나잇',
  '야설',
  '딸딸이',
  '딸감',
  '자지',
  '보지',
  '좆',
  '유두',
  '젖꼭지',
  '애널',
  '후장',
  '박아줘',
  '질싸',
  '질내사정',
  '중출',
  '발정',
  '꼴려',
  '꼴린',
  '꼴리',
  '강간',
  '성폭행',
  '능욕',
  '준강간',
  '야해줘',
  '야하게',
  '팬티벗어',
  '헨타이',
  '근친',
  '네토라레',
  '조건만남',
  '성매매',
  '원조교제',
  '로리',
  '로리타',
  '로리콘',
  '롤리콘',
  '롤리타',
  '쇼타',
  '쇼타콘',
]

/**
 * 짧은 토큰이 정상 단어 안에 들어가는 경우.
 * 검사 전에 지운다. ("칼로리" 안의 "로리", "섹터" 안의 "섹트")
 */
const KOREAN_SEXUAL_ALLOW = [
  '칼로리',
  '글로리',
  '로리팝',
  '플로리다',
  '쇼타임',
  '보자기',
  '섹터',
  '인섹트',
  '못박아',
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
  /\bkms\b/i,
  /\bun[\s-]?alive\b/i,
  /\boff\s+my\s*self\b/i,
  /\bend\s+it\s+all\b/i,
  /\bslit(?:ting)?\s+my\s+wrists?\b/i,
  /\bwish\s+i\s+(?:was|were)\s+dead\b/i,
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
  /\b(?:mother|cluster)?fuck(?:ing|ed|ers?|s)?\b/i,
  /\bdicks?\b/i,
  /\bcocks?\b/i,
  /\bpuss(?:y|ies)\b/i,
  /\bcunts?\b/i,
  /\bboobs?\b/i,
  /\btits\b/i,
  /\bnipples?\b/i,
  /\bcum(?:ming|med|s)?\b/i,
  /\bcreampies?\b/i,
  /\bejaculat\w*/i,
  /\banal\b/i,
  /\bdildos?\b/i,
  /\brap(?:e|es|ed|ing|ist)s?\b/i,
  /\bnon[\s-]?con(?:sent(?:ual)?)?\b/i,
  /\bhentai\b/i,
  /\bonly[\s-]?fans\b/i,
  /\brule[\s-]?34\b/i,
  /\bincest(?:uous)?\b/i,
  /\bloli(?:[\s-]?con|ta)?s?\b/i,
  /\bshota(?:[\s-]?con)?s?\b/i,
  /\bunder[\s-]?age\b/i,
  /\bjail[\s-]?bait\b/i,
  /\bcsam\b/i,
  /\bchild\s+porn(?:ography)?\b/i,
]

const KOREAN_VIOLENCE = [
  '살해해', '살해하', '살인해', '살인하', '죽여버', '죽여줘', '죽여야',
  '때려죽', '칼로찌', '칼로찔', '목을베', '목을잘라', '목을졸라',
  '총으로쏴', '총으로쏘', '고문해', '고문하', '폭행해', '폭행하',
  '구타해', '구타하', '학살해', '학살하', '살육', '참수', '토막살인',
  '시체훼손', '사지절단', '피투성이로만',
]

const ENGLISH_VIOLENCE = [
  /\b(?:kill|murder|slaughter)\s+(?:him|her|them|someone|you)\b/i,
  /\b(?:stab|shoot|strangle|torture|beat)\s+(?:him|her|them|someone|you)\b/i,
  /\b(?:behead|dismember|mutilate)\b/i,
  /\bgraphic\s+(?:violence|gore|murder)\b/i,
]

function compactKorean(text: string): string {
  return text.toLowerCase().replace(/[\s.,!?~*"'`\-_·…「」『』()[\]{}]+/g, '')
}

function withoutAllowlist(compact: string, allow: string[]): string {
  return allow.reduce((text, phrase) => text.replaceAll(phrase, ''), compact)
}

/** 메시지가 전송 가능한지 검사한다. 자해 표현이 성적 표현보다 우선한다. */
export function checkMessageSafety(text: string): SafetyResult {
  const compact = compactKorean(text)
  const sexualText = withoutAllowlist(compact, KOREAN_SEXUAL_ALLOW)

  if (
    KOREAN_SELF_HARM.some((term) => compact.includes(term)) ||
    ENGLISH_SELF_HARM.some((pattern) => pattern.test(text))
  ) {
    return { ok: false, category: 'self_harm' }
  }

  if (
    KOREAN_SEXUAL.some((term) => sexualText.includes(term)) ||
    ENGLISH_SEXUAL.some((pattern) => pattern.test(text))
  ) {
    return { ok: false, category: 'sexual' }
  }

  if (
    KOREAN_VIOLENCE.some((term) => compact.includes(term)) ||
    ENGLISH_VIOLENCE.some((pattern) => pattern.test(text))
  ) {
    return { ok: false, category: 'violence' }
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
  violence:
    "This message wasn't sent. whatsnext doesn't support graphic violence or threats of harm. " +
    'Please rephrase it.',
}

export const SAFETY_OUTPUT_NOTICES: Record<SafetyCategory, string> = {
  self_harm: 'This reply was hidden because it may contain unsafe self-harm content.',
  sexual: 'This reply was hidden because sexually explicit (19+) content is unavailable in safety mode.',
  violence: 'This reply was hidden because graphic violence is unavailable in safety mode.',
}
