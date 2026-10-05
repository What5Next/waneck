import { useQuery } from '@tanstack/react-query'

import { getNexPackages } from '@/lib/api/nex-packages'
import { queryKeys } from '@/lib/api/query-keys'

export function useNexPackagesQuery() {
  return useQuery({
    queryKey: queryKeys.nexPackages.list(),
    queryFn: getNexPackages,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
