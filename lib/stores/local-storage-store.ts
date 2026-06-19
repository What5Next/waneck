/**
 * localStorage 동기화 인프라.
 * sidebar-context의 collapse 패턴을 키별로 재사용한다.
 * 컴포넌트 간 같은 설정을 실시간으로 공유할 때 사용한다.
 */

const listenersByKey = new Map<string, Set<() => void>>()

function getListeners(storageKey: string) {
  let listeners = listenersByKey.get(storageKey)
  if (!listeners) {
    listeners = new Set()
    listenersByKey.set(storageKey, listeners)
  }
  return listeners
}

/** storageKey 변경 구독 */
export function subscribeStorageKey(
  storageKey: string,
  onStoreChange: () => void,
) {
  const listeners = getListeners(storageKey)
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

/** storageKey 변경 알림 — setStorageItem 후 호출 */
export function notifyStorageKey(storageKey: string) {
  getListeners(storageKey).forEach((listener) => listener())
}

/** localStorage 읽기 (SSR 안전) */
export function getStorageItem(storageKey: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(storageKey)
}

/** localStorage 쓰기 + 구독자 알림 */
export function setStorageItem(storageKey: string, value: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey, value)
  notifyStorageKey(storageKey)
}
