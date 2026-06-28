import type { Tables } from "./database.types";

export type Character = Tables<"characters">;
export type DBMessage = Tables<"messages">;
export type Conversation = Tables<"conversations">;
export type User = Tables<"users">;
export type TokenTransaction = Tables<"token_transactions">;
export type ConvSummary = Tables<"conv_summaries">;
export type CharacterExampleDialogue = Tables<"character_example_dialogues">;
export type CharacterSituationImage = Tables<"character_situation_images">;
export type CharacterIntroMessage = Pick<
  Tables<"character_intro_messages">,
  "role" | "content" | "created_at" | "sort_order"
>;

/** 캐릭터 댓글 (API 응답) */
export type CharacterComment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  author: { id: string; display_name: string | null };
  like_count: number;
  /** 로그인 사용자에게만 포함 */
  is_liked?: boolean;
  /** GET nested 응답용 (1단계 답글) */
  replies?: CharacterComment[];
};

export type CharacterWithDetail = Character & {
  creator: { display_name: string | null } | null;
  intro_messages: CharacterIntroMessage[];
  /** 로그인 시에만 포함 */
  is_liked?: boolean;
};

// UI 채팅 상태용 타입 (DB에 직접 저장하지 않음)
export type Message = {
  role: "user" | "model";
  content: string;
  time: string;
};
