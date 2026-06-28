import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getAiModels } from '@/lib/api/ai-models'
import { setCachedActiveAiModels } from '@/lib/ai-models'
import { queryKeys } from '@/lib/api/query-keys'

/**
 * 활성 AI 모델 목록 Query.
 * model-selector / mypage / default model 설정이 동일 캐시를 공유한다.
 */
export function useAiModelsQuery() {
  const query = useQuery({
    queryKey: queryKeys.aiModels.list(),
    queryFn: getAiModels,
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (query.data) {
      setCachedActiveAiModels(query.data)
    }
  }, [query.data])

  return query
}
