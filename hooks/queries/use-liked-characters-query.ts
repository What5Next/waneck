import { useQuery } from '@tanstack/react-query'

import { getLikedCharacters } from '@/lib/api/character-likes'
import { queryKeys } from '@/lib/api/query-keys'

export function useLikedCharactersQuery(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.characters.liked(),
    queryFn: getLikedCharacters,
    enabled,
    staleTime: 60_000,
  })
}
