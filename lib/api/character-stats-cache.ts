import type { Character, CharacterWithDetail } from '@/lib/types'
import { queryKeys } from '@/lib/api/query-keys'
import type { QueryClient } from '@tanstack/react-query'

/** detail + list 캐시에서 집계 필드 패치 */
export function patchCharacterStatsInCache(
  queryClient: QueryClient,
  characterId: string,
  patch: Partial<Pick<Character, 'like_count' | 'comment_count' | 'message_count'>>,
) {
  queryClient.setQueryData<CharacterWithDetail>(
    queryKeys.characters.detail(characterId),
    (prev) => (prev ? { ...prev, ...patch } : prev),
  )

  queryClient.setQueryData<Character[]>(queryKeys.characters.list(), (prev) =>
    prev?.map((character) =>
      character.id === characterId ? { ...character, ...patch } : character,
    ),
  )
}

/** detail 캐시에서 is_liked 패치 */
export function patchCharacterEngagementInCache(
  queryClient: QueryClient,
  characterId: string,
  patch: Partial<Pick<CharacterWithDetail, 'is_liked'>>,
) {
  queryClient.setQueryData<CharacterWithDetail>(
    queryKeys.characters.detail(characterId),
    (prev) => (prev ? { ...prev, ...patch } : prev),
  )
}

/** 채팅 1턴(user+model) 후 message_count +2 */
export function bumpCharacterMessageCountInCache(
  queryClient: QueryClient,
  characterId: string,
  delta = 2,
) {
  const applyDelta = (count: number | undefined) => Math.max(0, (count ?? 0) + delta)

  queryClient.setQueryData<CharacterWithDetail>(
    queryKeys.characters.detail(characterId),
    (prev) =>
      prev ? { ...prev, message_count: applyDelta(prev.message_count) } : prev,
  )

  queryClient.setQueryData<Character[]>(queryKeys.characters.list(), (prev) =>
    prev?.map((character) =>
      character.id === characterId
        ? { ...character, message_count: applyDelta(character.message_count) }
        : character,
    ),
  )
}
