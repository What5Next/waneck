'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import type { ModelId } from '@/components/chat/model-selector'
import type { BrowseViewMode } from '@/components/characters/character-browse-toolbar'
import { useAiModelsQuery } from '@/hooks/queries/use-ai-models-query'
import {
  getCachedActiveAiModels,
  resolveStoredModelId,
} from '@/lib/ai-models'
import {
  getStorageItem,
  setStorageItem,
  subscribeStorageKey,
} from '@/lib/stores/local-storage-store'
import {
  BROWSE_VIEW_STORAGE_KEY,
  DEFAULT_MODEL_KEY,
  getChatRoomNameStorageKey,
  readSafetyFilterFromStorage,
  SAFETY_FILTER_KEY,
} from '@/lib/user-settings'

function readDefaultModelFromStorage(): ModelId {
  const stored = getStorageItem(DEFAULT_MODEL_KEY)
  const models = getCachedActiveAiModels()
  const resolved = resolveStoredModelId(stored, models)

  if (resolved) {
    return resolved
  }

  return models[0]?.id ?? stored ?? ''
}

function readDefaultModelServerSnapshot(): ModelId {
  return getCachedActiveAiModels()[0]?.id ?? ''
}

/**
 * 세이프티 필터 — user-menu ↔ mypage 실시간 동기화.
 */
export function useSafetyFilter() {
  const enabled = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SAFETY_FILTER_KEY, onStoreChange),
    readSafetyFilterFromStorage,
    () => true,
  )

  const setEnabled = useCallback((nextEnabled: boolean) => {
    setStorageItem(SAFETY_FILTER_KEY, String(nextEnabled))
  }, [])

  return { enabled, setEnabled }
}

/**
 * 기본 채팅 모델 — mypage 표시 ↔ chat-window 연동.
 */
export function useDefaultModel() {
  const modelId = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(DEFAULT_MODEL_KEY, onStoreChange),
    readDefaultModelFromStorage,
    readDefaultModelServerSnapshot,
  )

  const setModelId = useCallback((nextModelId: ModelId) => {
    setStorageItem(DEFAULT_MODEL_KEY, nextModelId)
  }, [])

  return { modelId, setModelId }
}

/**
 * 모델 목록 로드 후 유효한 ai_models.id를 보장.
 * localStorage에 model_name(레거시)이 저장돼 있으면 id로 자동 마이그레이션.
 */
export function useResolvedDefaultModel() {
  const { modelId, setModelId } = useDefaultModel()
  const { data: models = [] } = useAiModelsQuery()

  const resolvedModelId =
    resolveStoredModelId(modelId, models) ?? models[0]?.id ?? modelId

  useEffect(() => {
    if (!resolvedModelId || resolvedModelId === modelId) {
      return
    }
    setModelId(resolvedModelId)
  }, [resolvedModelId, modelId, setModelId])

  return { modelId: resolvedModelId, setModelId }
}

/**
 * 탐색 페이지 list/grid 뷰 모드.
 */
export function useBrowseViewMode() {
  const viewMode = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(BROWSE_VIEW_STORAGE_KEY, onStoreChange),
    readBrowseViewModeFromStorage,
    () => 'list' as BrowseViewMode,
  )

  const setViewMode = useCallback((nextViewMode: BrowseViewMode) => {
    setStorageItem(BROWSE_VIEW_STORAGE_KEY, nextViewMode)
  }, [])

  return { viewMode, setViewMode }
}

/**
 * 동적 storageKey 기반 문자열 설정 (채팅방 이름 등).
 */
export function useStoredString(storageKey: string, fallback: string) {
  const readValue = useCallback(() => {
    const stored = getStorageItem(storageKey)?.trim()
    return stored || fallback
  }, [storageKey, fallback])

  const value = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(storageKey, onStoreChange),
    readValue,
    () => fallback,
  )

  const setValue = useCallback(
    (nextValue: string) => {
      setStorageItem(storageKey, nextValue)
    },
    [storageKey],
  )

  return { value, setValue, readValue }
}

/**
 * 채팅방 이름 — 대화별 localStorage 저장.
 */
export function useChatRoomName(
  characterId: string,
  characterName: string,
  conversationId?: string | null,
) {
  const storageKey = getChatRoomNameStorageKey(characterId, conversationId)
  return useStoredString(storageKey, characterName)
}

function readBrowseViewModeFromStorage(): BrowseViewMode {
  const stored = getStorageItem(BROWSE_VIEW_STORAGE_KEY)
  return stored === 'grid' ? 'grid' : 'list'
}
