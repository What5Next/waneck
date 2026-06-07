import type { Tables } from './database.types'

export type Character = Tables<'characters'>
export type DBMessage = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type User = Tables<'users'>
export type ConvSummary = Tables<'conv_summaries'>
export type CharacterExampleDialogue = Tables<'character_example_dialogues'>
export type CharacterSituationImage = Tables<'character_situation_images'>

// UI 채팅 상태용 타입 (DB에 직접 저장하지 않음)
export type Message = {
  role: 'user' | 'model'
  content: string
  time: string
}
