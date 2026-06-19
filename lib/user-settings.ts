import { getStorageItem } from '@/lib/stores/local-storage-store'

export const SAFETY_FILTER_KEY = 'waneck-safety-filter'
export const DEFAULT_MODEL_KEY = 'waneck-default-model'
export const BROWSE_VIEW_STORAGE_KEY = 'waneck-browse-view'
export const CHAT_ROOM_NAME_KEY_PREFIX = 'waneck-chat-room-name:'
export const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

export const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@waneck.app'

/** localStorage에서 세이프티 필터 설정 읽기 (SSR 기본값: true) */
export function readSafetyFilterFromStorage(): boolean {
  const stored = getStorageItem(SAFETY_FILTER_KEY)
  return stored !== null ? stored === 'true' : true
}

/** 대화방 이름 localStorage 키 */
export function getChatRoomNameStorageKey(
  characterId: string,
  conversationId?: string | null,
): string {
  const id = conversationId ?? characterId
  return `${CHAT_ROOM_NAME_KEY_PREFIX}${id}`
}
