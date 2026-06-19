/**
 * TanStack Query key factory.
 * invalidateQueries / removeQueries 시 키 불일치를 막기 위해 여기서만 정의한다.
 *
 * @example
 * queryKeys.characters.list() // ['characters', 'list']
 * queryKeys.profile.me()      // ['profile', 'me']
 */
export const queryKeys = {
  characters: {
    all: ['characters'] as const,
    list: () => [...queryKeys.characters.all, 'list'] as const,
  },
  profile: {
    all: ['profile'] as const,
    /** 현재 로그인 사용자 프로필 */
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    /** 사이드바 최근 대화 목록 */
    list: () => [...queryKeys.conversations.all, 'list'] as const,
  },
} as const
