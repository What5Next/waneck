import { useQuery } from "@tanstack/react-query";

import { getCharacters } from "@/lib/api/characters";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * 공개 캐릭터 목록 Query.
 * 홈·탐색 페이지가 동시에 마운트되거나 연속 이동해도 캐시를 공유한다.
 */
export function useCharactersQuery() {
  return useQuery({
    queryKey: queryKeys.characters.list(),
    queryFn: getCharacters,
    // 목록은 자주 변하지 않음 — 홈↔탐색 이동 시 중복 fetch 방지
    staleTime: 60_000,
  });
}
