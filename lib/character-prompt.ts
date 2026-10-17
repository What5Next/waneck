export type ExampleDialogue = { user: string; character: string }

export type CharacterPromptFields = {
  identity: string
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

const PREFIX = 'WANECK_CHARACTER_PROFILE_V1\n'

export const EMPTY_CHARACTER_PROMPT: CharacterPromptFields = {
  identity: '',
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

/** Stored in the existing system_prompt column, so the chat server receives every field. */
export function buildCharacterPrompt(name: string, fields: CharacterPromptFields): string {
  const examples = fields.examples
    .map(({ user, character }) => ({ user: user.trim(), character: character.trim() }))
    .filter(({ user, character }) => user && character)

  return PREFIX + JSON.stringify({
    instruction: `Roleplay as ${name.trim()}. Keep the character's specific personality, motives, relationship, voice and reactions consistent across the conversation. Treat the examples as style demonstrations, not events that already happened. Adapt to the user's choices without controlling the user or repeating the same response pattern.`,
    identity: fields.identity.trim(),
    personality_and_inner_conflict: fields.personality.trim(),
    backstory_and_world: fields.backstory.trim(),
    relationship_with_user: fields.relationship.trim(),
    current_scenario: fields.scenario.trim(),
    voice_and_dialogue_style: fields.voice.trim(),
    storytelling_style: {
      viewpoint: fields.viewpoint,
      pacing: fields.pacing,
      response_length: fields.replyLength,
    },
    reactions_and_boundaries: fields.reactions.trim(),
    example_dialogues: examples,
    additional_instructions: fields.additional.trim(),
  }, null, 2)
}

export function parseCharacterPrompt(prompt: string): CharacterPromptFields {
  if (!prompt.startsWith(PREFIX)) {
    // Keep old, freeform prompts fully editable without losing their content.
    return { ...EMPTY_CHARACTER_PROMPT, examples: [{ user: '', character: '' }], additional: prompt }
  }

  try {
    const value = JSON.parse(prompt.slice(PREFIX.length)) as Record<string, unknown>
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
      identity: read('identity'),
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
