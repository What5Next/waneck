import type { Tables } from './database.types'

export type Character = Tables<'characters'>
export type DBMessage = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type User = Tables<'users'>
export type TokenTransaction = Tables<'token_transactions'>
export type ConvSummary = Tables<'conv_summaries'>
export type CharacterExampleDialogue = Tables<'character_example_dialogues'>
export type CharacterSituationImage = Tables<'character_situation_images'>
export type CharacterIntroMessage = Pick<
  Tables<'character_intro_messages'>,
  'role' | 'content' | 'created_at' | 'sort_order'
>

export type CharacterWithDetail = Character & {
  creator: { display_name: string | null } | null
  intro_messages: CharacterIntroMessage[]
}

// UI 채팅 상태용 타입 (DB에 직접 저장하지 않음)
export type Message = {
  role: 'user' | 'model'
  content: string
  time: string
}
