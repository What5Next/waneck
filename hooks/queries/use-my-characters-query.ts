import { useQuery } from '@tanstack/react-query'

import { getMyCharacters } from '@/lib/api/characters'
import { queryKeys } from '@/lib/api/query-keys'

export function useMyCharactersQuery(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.characters.mine(),
    queryFn: getMyCharacters,
    enabled,
    staleTime: 60_000,
  })
}
