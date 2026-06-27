import { useQuery } from '@tanstack/react-query'

import { getCharacterConversations } from '@/lib/api/conversations'
import { queryKeys } from '@/lib/api/query-keys'

export function useCharacterConversationsQuery(characterId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.conversations.byCharacter(characterId),
    queryFn: () => getCharacterConversations(characterId),
    enabled,
    staleTime: 30_000,
  })
}
