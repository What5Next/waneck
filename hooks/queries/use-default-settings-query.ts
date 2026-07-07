import { useQuery } from '@tanstack/react-query'

import { fetchDefaultSettings } from '@/lib/api/user-settings'
import { queryKeys } from '@/lib/api/query-keys'

type UseDefaultSettingsQueryOptions = {
  enabled?: boolean
}

/** My Page / 채팅 설정 — prompt·persona·preferences 일괄 조회 */
export function useDefaultSettingsQuery(
  options: UseDefaultSettingsQueryOptions = {},
) {
  const { enabled = true } = options

  return useQuery({
    queryKey: queryKeys.userSettings.defaultSettings(),
    queryFn: fetchDefaultSettings,
    enabled,
    staleTime: 30_000,
  })
}
