import { EMPTY_CHARACTER_PROMPT, type CharacterPromptFields } from '@/lib/character-prompt'

type TextKey = 'personality' | 'backstory' | 'relationship' | 'session' | 'voice' |
  'reactions' | 'dialogueRules' | 'progressionRules' | 'eventRules' | 'additional'
type Target = TextKey | keyof CharacterPromptFields['template']

const headingRules: Array<[RegExp, Target]> = [
  [/^(기본\s*정보|basic\s*(information|profile))$/i, 'basic'],
  [/^(성격|성향|personality|character\s*traits)$/i, 'personality'],
  [/^(말투|말투\s*특성|화법|voice|speaking\s*style)$/i, 'voice'],
  [/^(심리\s*구조|심리|psychology|inner\s*conflict)$/i, 'psychology'],
  [/^(외형|외모|appearance|looks)$/i, 'appearance'],
  [/^(취미(와|와\s*)?\s*특기|취미|특기|hobbies|skills)$/i, 'hobbies'],
  [/^(능력.*|무기.*|장비.*|abilities|equipment)$/i, 'abilities'],
  [/^(버릇|습관|habits)$/i, 'habits'],
  [/^(취향|좋아함|싫어함|preferences)$/i, 'preferences'],
  [/^(일과|하루\s*일과|daily\s*routine)$/i, 'routine'],
  [/^(nsfw|사적\s*관계)$/i, 'intimacy'],
  [/^(관계.*|.*와의\s*관계|.*대인.*|relationship.*)$/i, 'relationship'],
  [/^(주인공|사용자\s*역할|시작\s*설정|세션\s*정보|세션정보|현재\s*상황|시작\s*상황|상황\s*정보|starting\s*setup|starting\s*situation|session)$/i, 'session'],
  [/^(세계관\s*핵심|세계관|장르|world.*)$/i, 'world'],
  [/^(시간적\s*배경|시대|time.*|era)$/i, 'time'],
  [/^(배경\s*무대|주거\s*공간|주거공간|장소|places|home)$/i, 'places'],
  [/^(구조와\s*시스템|세계의\s*구조|systems)$/i, 'systems'],
  [/^(갈등.*|핵심\s*갈등|conflicts?)$/i, 'conflicts'],
  [/^(톤.*|분위기|mood)$/i, 'tone'],
  [/^(존재론.*|생태.*|ontology|ecology)$/i, 'ontology'],
  [/^(과거.*|배경|배경\s*설정|backstory)$/i, 'backstory'],
  [/^(대화\s*규칙|대화\s*지침|대화규칙|dialogue\s*rules|롤플레잉\s*규칙)$/i, 'dialogueRules'],
  [/^(진행\s*규칙|스토리\s*진행|상태창|호감도|progression|state\s*rules)$/i, 'progressionRules'],
  [/^(이벤트|시간\s*규칙|시점별\s*사건|events?|timed\s*events)$/i, 'eventRules'],
  [/^(반응.*|경계.*|reactions?)$/i, 'reactions'],
  [/^(기타\s*설정|추가\s*지침|핵심\s*지침|핵심지침|출력지침|효과.*묘사|other.*|extra.*)$/i, 'additional'],
]

function targetFor(label: string): Target | null {
  const clean = label.replace(/^[#!\-ㅡ\s]+|[#!\-ㅡ\s]+$/g, '').trim()
  return headingRules.find(([pattern]) => pattern.test(clean))?.[1] ?? null
}

function append(result: CharacterPromptFields, target: Target, value: string) {
  let text = value.trim()
  if (target === 'basic') text = text.split('\n').filter((line) => !/^\s*(이름|name)\s*[:：]/i.test(line)).join('\n').trim()
  if (!text) return
  if (target in result.template) {
    const key = target as keyof CharacterPromptFields['template']
    result.template[key] = [result.template[key], text].filter(Boolean).join('\n\n')
  } else {
    const key = target as TextKey
    result[key] = [result[key], text].filter(Boolean).join('\n\n')
  }
}

const inferredRules: Array<[RegExp, Target]> = [
  [/(성별|나이|국적|직업|생일|출생|\d+세|\d+살)/, 'basic'],
  [/(말투|목소리|존댓말|반말|호칭|말버릇|어휘)/, 'voice'],
  [/(외모|외형|머리카락|눈동자|피부색|체격|키\s*\d+)/, 'appearance'],
  [/(성격|기질|내면|두려움|집착|욕망|소심|대담)/, 'personality'],
  [/(심리|애착|방어\s*기제|콤플렉스|MBTI)/i, 'psychology'],
  [/(사용자|유저|\{\{user\}\}).{0,24}(관계|신뢰|만남|동료)|(?:관계|신뢰|만남|동료).{0,24}(사용자|유저|\{\{user\}\})/i, 'relationship'],
  [/(첫\s*장면|시작\s*상황|현재\s*상황|대화\s*시작|처음\s*만나)/, 'session'],
  [/(대화\s*규칙|출력\s*형식|서술\s*방식|기울임꼴|사용자의\s*행동을\s*대신)/, 'dialogueRules'],
  [/(호감도|상태창|신뢰도|상태\s*변화|매\s*턴)/, 'progressionRules'],
  [/(D-?DAY|\d+일째|\d+일\s*(후|전)|특정\s*시점|이벤트)/i, 'eventRules'],
  [/(세계관|마법\s*체계|종족|정치\s*구조)/, 'world'],
  [/(도시|국가|지역|집|방|학교|자료실)/, 'places'],
]

function inferTarget(line: string): Target | null {
  return inferredRules.find(([pattern]) => pattern.test(line))?.[1] ?? null
}

/** Local grouping; original freeform text is always preserved. */
export function organizeCharacterPrompt(source: string): CharacterPromptFields {
  const result: CharacterPromptFields = {
    ...EMPTY_CHARACTER_PROMPT,
    template: { ...EMPTY_CHARACTER_PROMPT.template },
    examples: [{ user: '', character: '' }],
  }
  let target: Target | null = null
  let buffer: string[] = []
  const flush = () => {
    if (target) append(result, target, buffer.join('\n'))
    buffer = []
  }
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      buffer.push(rawLine)
      continue
    }
    const heading = line.match(/^(?:#{1,6}\s*|\[\s*|ㅡ\s*)(.+?)(?:\s*\]|\s*ㅡ)?\s*$/)?.[1]
    if (heading) {
      flush()
      target = targetFor(heading)
      continue
    }
    const inline = line.match(/^[-*]?\s*([^:：]{2,30})\s*[:：]\s*(.+)$/)
    const inlineTarget = inline ? targetFor(inline[1]) : null
    if (inlineTarget && inline) {
      flush()
      target = inlineTarget
      buffer.push(`${inline[1]}: ${inline[2]}`)
      continue
    }
    if (target) {
      buffer.push(rawLine)
      continue
    }
    const inferred = inferTarget(line)
    if (inferred) append(result, inferred, line)
  }
  flush()
  return result
}
