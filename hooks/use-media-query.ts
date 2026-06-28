'use client'

import { useSyncExternalStore } from 'react'

/** Tailwind `sm` 브레이크포인트와 동일 (640px) */
export const DESKTOP_MEDIA_QUERY = '(min-width: 640px)'

function subscribeToMediaQuery(query: string, onStoreChange: () => void) {
  const mediaQueryList = window.matchMedia(query)
  mediaQueryList.addEventListener('change', onStoreChange)
  return () => mediaQueryList.removeEventListener('change', onStoreChange)
}

function getMediaQuerySnapshot(query: string) {
  return window.matchMedia(query).matches
}

function getMediaQueryServerSnapshot() {
  // SSR·하이드레이션 전: 모바일 우선(라우팅) — PC 클릭은 하이드레이션 후 overlay로 처리
  return false
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => subscribeToMediaQuery(query, onStoreChange),
    () => getMediaQuerySnapshot(query),
    getMediaQueryServerSnapshot,
  )
}

/** PC(sm 이상) 여부 — 카드 클릭 시 라우팅 대신 모달 오버레이 사용 */
export function useIsDesktop() {
  return useMediaQuery(DESKTOP_MEDIA_QUERY)
}
