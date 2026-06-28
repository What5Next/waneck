import { useQuery } from '@tanstack/react-query'

import { getCharacterComments } from '@/lib/api/character-comments'
import { queryKeys } from '@/lib/api/query-keys'

type Options = {
  enabled?: boolean
}

export function useCharacterCommentsQuery(characterId: string, options: Options = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.characters.comments(characterId),
    queryFn: () => getCharacterComments(characterId),
    enabled: enabled && !!characterId,
    staleTime: 30_000,
  })
}
