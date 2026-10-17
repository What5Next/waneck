export type ExampleDialogue = { user: string; character: string }

export const CHARACTER_TEMPLATE_SECTIONS = [
  { key: 'basic', title: 'Basic information', guide: 'Describe the character’s background, such as their age, gender, nationality, and occupation.', example: 'Gender: woman / Age: 29 / Nationality: British / Occupation: audio archivist / Birthday: October 12' },
  { key: 'psychology', title: 'Psychology', guide: 'Show what the character wants, fears, and does when emotionally cornered.', example: 'Mara fears being abandoned after a mistake. When anxious, she checks recordings again instead of asking for reassurance.' },
  { key: 'appearance', title: 'Appearance', guide: 'Describe details the user would notice when meeting the character.', example: 'Mara has short black hair, gray eyes, and ink stains on her fingers. Her voice is low and slightly hoarse.' },
  { key: 'hobbies', title: 'Hobbies and strengths', guide: 'Add interests or skills that can naturally come up in your conversations.', example: 'She restores old cassette tapes for fun and can identify a recording device by its background noise.' },
  { key: 'abilities', title: 'Abilities and equipment', guide: 'Describe what the character can do and the limits that create tension.', example: 'Mara can repair damaged audio and trace edits in a recording. She carries a small recorder and spare batteries.' },
  { key: 'habits', title: 'Habits', guide: 'Choose a small, recognizable habit that reveals the character’s feelings.', example: 'When hiding worry, she taps the edge of her recorder twice. She avoids eye contact before admitting a mistake.' },
  { key: 'preferences', title: 'Preferences', guide: 'Pick preferences that could shape choices or spark conversation with the user.', example: 'She likes quiet rooms and black tea. She dislikes people touching her recordings without asking.' },
  { key: 'routine', title: 'Daily routine', guide: 'Set a simple routine that gives the user natural moments to meet them.', example: 'Mornings: sort new tapes. Afternoons: restore damaged files. Evenings: review clues with the user.' },
  { key: 'intimacy', title: 'NSFW', guide: 'If relevant, describe boundaries and how the character communicates them.', example: 'She needs clear consent and privacy. When uncomfortable, she states her boundary directly.' },
  { key: 'world', title: 'World core', guide: 'State the genre and one or two rules that affect the character and user.', example: 'Genre: mystery. The city archive is closing in seven days, and a missing recording could expose a long-hidden secret.' },
  { key: 'time', title: 'Time and era', guide: 'Explain when the story takes place and which time rules matter to it.', example: 'Present day. The archive closes at 10 p.m.; each day brings the closure one day closer.' },
  { key: 'places', title: 'Places and home', guide: 'Describe places the character and user can actually visit together.', example: 'The city archive has a public desk, a locked storage room, and Mara’s repair booth. The user can move between them.' },
  { key: 'systems', title: 'World systems', guide: 'Add only systems that change what the two can do in the story.', example: 'Only staff badges open the storage room. Every checkout leaves a timestamp in the archive log.' },
  { key: 'conflicts', title: 'Conflicts', guide: 'Give the character and user a shared problem that can develop over time.', example: 'Mara wants to save the recording before the archive closes, but sharing it could cost her job.' },
  { key: 'tone', title: 'Tone and mood', guide: 'Choose the feeling you want scenes and conversations to carry.', example: 'Quiet, tense mystery. Small sounds and pauses reveal more than dramatic speeches.' },
  { key: 'supporting', title: 'Supporting characters', guide: 'Legacy background information; additional chat participants are not created.', example: 'Background figures stay offscreen unless the story requires them.' },
  { key: 'ontology', title: 'Beings and ecology', guide: 'Describe non-speaking elements only if they affect the story’s rules.', example: 'The archive uses an aging AI index that sometimes mislabels damaged recordings; it cannot speak or make decisions.' },
  { key: 'misc', title: 'Other details', guide: 'Add one important detail that should stay consistent in the chat.', example: 'Mara knows the archive’s layout but does not know who removed the recording.' },
] as const

export type CharacterTemplateKey = typeof CHARACTER_TEMPLATE_SECTIONS[number]['key']
export type CharacterTemplate = Record<CharacterTemplateKey, string>
export const EMPTY_CHARACTER_TEMPLATE = Object.fromEntries(
  CHARACTER_TEMPLATE_SECTIONS.map(({ key }) => [key, '']),
) as CharacterTemplate

export type CharacterPromptFields = {
  identity: string
  session: string
  dialogueRules: string
  progressionRules: string
  eventRules: string
  template: CharacterTemplate
  personality: string
  backstory: string
  relationship: string
  scenario: string
  voice: string
  viewpoint: 'automatic' | 'first' | 'second' | 'third'
  pacing: 'natural' | 'slow' | 'fast'
  replyLength: 'adaptive' | 'short' | 'medium' | 'long'
  reactions: string
  examples: ExampleDialogue[]
  additional: string
}

const LEGACY_PREFIX = 'WANECK_CHARACTER_PROFILE_V1\n'
const PREFIX = 'WANECK_CHARACTER_PROFILE_V2\n'
const SECTION_MARKER = /\n\n<!-- WANECK:([a-z0-9_]+) -->\n/g

export const EMPTY_CHARACTER_PROMPT: CharacterPromptFields = {
  identity: '',
  session: '',
  dialogueRules: '',
  progressionRules: '',
  eventRules: '',
  template: { ...EMPTY_CHARACTER_TEMPLATE },
  personality: '',
  backstory: '',
  relationship: '',
  scenario: '',
  voice: '',
  viewpoint: 'automatic',
  pacing: 'natural',
  replyLength: 'adaptive',
  reactions: '',
  examples: [{ user: '', character: '' }],
  additional: '',
}

/** Stored as readable text because the chat service sends system_prompt directly to the model. */
export function buildCharacterPrompt(name: string, fields: CharacterPromptFields): string {
  const sections: string[] = [
    PREFIX.trimEnd(),
    `Roleplay as ${name.trim()}. Keep the character's specific personality, motives, relationships, voice, and reactions consistent. Treat examples as style demonstrations, not past events. Adapt to the user's choices without controlling the user.`,
  ]
  const add = (key: string, title: string, value: string) => {
    if (value.trim()) sections.push(`<!-- WANECK:${key} -->\n## ${title}\n${value.trim()}`)
  }

  add('freeform', 'Character concept', fields.identity)
  add('session', 'Session and starting setup', fields.session)
  add('dialogue_rules', 'Dialogue and portrayal rules', fields.dialogueRules)
  add('progression_rules', 'Progression and state rules', fields.progressionRules)
  add('event_rules', 'Events and time rules', fields.eventRules)
  for (const { key, title } of CHARACTER_TEMPLATE_SECTIONS) {
    add(`template_${key}`, title, fields.template[key])
  }
  add('personality', 'Personality and inner conflict', fields.personality)
  add('backstory', 'Backstory and world', fields.backstory)
  add('relationship', 'Relationship with the user', fields.relationship)
  add('scenario', 'Current situation', fields.scenario)
  add('voice', 'Voice and dialogue style', fields.voice)
  add('reactions', 'Reactions and boundaries', fields.reactions)
  add('additional', 'Extra instructions', fields.additional)
  if (fields.viewpoint !== 'automatic' || fields.pacing !== 'natural' || fields.replyLength !== 'adaptive') {
    sections.push(`<!-- WANECK:style -->\n## Story direction\nViewpoint: ${fields.viewpoint}\nPace: ${fields.pacing}\nReply length: ${fields.replyLength}`)
  }
  fields.examples.forEach((example, index) => {
    if (example.user.trim() && example.character.trim()) {
      add(`example_${index + 1}_user`, `Example ${index + 1}: user`, example.user)
      add(`example_${index + 1}_character`, `Example ${index + 1}: character`, example.character)
    }
  })
  return sections.join('\n\n')
}

function parseReadablePrompt(prompt: string): CharacterPromptFields {
  const sections = new Map<string, string>()
  const matches = [...prompt.matchAll(SECTION_MARKER)]
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index : prompt.length
    const block = prompt.slice(start, end).trimEnd()
    const value = block.replace(/^## [^\n]*\n/, '')
    sections.set(match[1], value)
  })
  const get = (key: string) => sections.get(key) ?? ''
  const style = get('style')
  const readStyle = (key: string) => style.match(new RegExp(`^${key}: (.*)$`, 'm'))?.[1] ?? ''
  const viewpoint = readStyle('Viewpoint')
  const pacing = readStyle('Pace')
  const replyLength = readStyle('Reply length')
  const examples = [1, 2, 3].map((index) => ({
    user: get(`example_${index}_user`),
    character: get(`example_${index}_character`),
  })).filter((example) => example.user || example.character)

  return {
    ...EMPTY_CHARACTER_PROMPT,
    identity: get('freeform'),
    session: get('session'),
    dialogueRules: get('dialogue_rules'),
    progressionRules: get('progression_rules'),
    eventRules: get('event_rules'),
    template: Object.fromEntries(CHARACTER_TEMPLATE_SECTIONS.map(({ key }) => [key, get(`template_${key}`)])) as CharacterTemplate,
    personality: get('personality'),
    backstory: get('backstory'),
    relationship: get('relationship'),
    scenario: get('scenario'),
    voice: get('voice'),
    reactions: get('reactions'),
    additional: get('additional'),
    viewpoint: ['automatic', 'first', 'second', 'third'].includes(viewpoint) ? viewpoint as CharacterPromptFields['viewpoint'] : 'automatic',
    pacing: ['natural', 'slow', 'fast'].includes(pacing) ? pacing as CharacterPromptFields['pacing'] : 'natural',
    replyLength: ['adaptive', 'short', 'medium', 'long'].includes(replyLength) ? replyLength as CharacterPromptFields['replyLength'] : 'adaptive',
    examples: examples.length ? examples : [{ user: '', character: '' }],
  }
}

export function parseCharacterPrompt(prompt: string): CharacterPromptFields {
  if (prompt.startsWith(PREFIX)) return parseReadablePrompt(prompt)
  if (!prompt.startsWith(LEGACY_PREFIX)) {
    // Existing plain prompts are shown in the main editor without losing their content.
    return { ...EMPTY_CHARACTER_PROMPT, examples: [{ user: '', character: '' }], identity: prompt }
  }

  try {
    const value = JSON.parse(prompt.slice(LEGACY_PREFIX.length)) as Record<string, unknown>
    const read = (key: string) => typeof value[key] === 'string' ? value[key] as string : ''
    const style = typeof value.storytelling_style === 'object' && value.storytelling_style !== null
      ? value.storytelling_style as Record<string, unknown> : {}
    const viewpoint = ['automatic', 'first', 'second', 'third'].includes(String(style.viewpoint))
      ? style.viewpoint as CharacterPromptFields['viewpoint'] : 'automatic'
    const pacing = ['natural', 'slow', 'fast'].includes(String(style.pacing))
      ? style.pacing as CharacterPromptFields['pacing'] : 'natural'
    const replyLength = ['adaptive', 'short', 'medium', 'long'].includes(String(style.response_length))
      ? style.response_length as CharacterPromptFields['replyLength'] : 'adaptive'
    const examples = Array.isArray(value.example_dialogues)
      ? value.example_dialogues.filter((item): item is ExampleDialogue =>
          typeof item === 'object' && item !== null &&
          typeof item.user === 'string' && typeof item.character === 'string')
      : []
    return {
      ...EMPTY_CHARACTER_PROMPT,
      identity: read('freeform_profile') || read('identity'),
      template: Object.fromEntries(CHARACTER_TEMPLATE_SECTIONS.map(({ key }) => [key, typeof (value.detailed_template as Record<string, unknown> | undefined)?.[key] === 'string' ? (value.detailed_template as Record<string, string>)[key] : ''])) as CharacterTemplate,
      personality: read('personality_and_inner_conflict'),
      backstory: read('backstory_and_world'),
      relationship: read('relationship_with_user'),
      scenario: read('current_scenario'),
      voice: read('voice_and_dialogue_style'),
      viewpoint,
      pacing,
      replyLength,
      reactions: read('reactions_and_boundaries'),
      examples: examples.length ? examples : [{ user: '', character: '' }],
      additional: read('additional_instructions'),
    }
  } catch {
    return { ...EMPTY_CHARACTER_PROMPT, examples: [{ user: '', character: '' }], additional: prompt }
  }
}
