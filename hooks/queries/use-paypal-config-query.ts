import { useQuery } from '@tanstack/react-query'

import { getPayPalConfig } from '@/lib/api/paypal'
import { queryKeys } from '@/lib/api/query-keys'

export function usePayPalConfigQuery() {
  return useQuery({
    queryKey: queryKeys.paypal.config(),
    queryFn: getPayPalConfig,
    staleTime: 5 * 60_000,
    retry: false,
  })
}
