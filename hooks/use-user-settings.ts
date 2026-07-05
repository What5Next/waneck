'use client'

import { useCallback } from 'react'

import type { ModelId } from '@/components/chat/model-selector'
import type { BrowseViewMode } from '@/components/characters/character-browse-toolbar'
import { useAuth } from '@/hooks/use-auth'
import { useUpdateConversationSettingsMutation } from '@/hooks/mutations/use-update-conversation-settings-mutation'
import { useUpdateUserPreferencesMutation } from '@/hooks/mutations/use-user-preferences-mutation'
import { useConversationSettingsQuery } from '@/hooks/queries/use-conversation-settings-query'
import { useDefaultSettingsQuery } from '@/hooks/queries/use-default-settings-query'
import { useAiModelsQuery } from '@/hooks/queries/use-ai-models-query'
import { resolveStoredModelId } from '@/lib/ai-models'
import {
  getStorageItem,
  setStorageItem,
  subscribeStorageKey,
} from '@/lib/stores/local-storage-store'
import {
  BROWSE_VIEW_STORAGE_KEY,
  getChatRoomNameStorageKey,
  readSafetyFilterFromStorage,
  SAFETY_FILTER_KEY,
} from '@/lib/user-settings'
import { useSyncExternalStore } from 'react'

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
 * 기본 채팅 모델 — DB user_preferences.default_model_id + ai_models fallback.
 * 레거시 localStorage(waneck-default-model)는 무시.
 */
export function useResolvedDefaultModel() {
  const { isAuthenticated } = useAuth()
  const { data: settings } = useDefaultSettingsQuery({
    enabled: isAuthenticated,
  })
  const { data: models = [] } = useAiModelsQuery()
  const updatePreferences = useUpdateUserPreferencesMutation()

  const dbModelId = settings?.preferences.defaultModelId ?? null
  const resolvedModelId =
    resolveStoredModelId(dbModelId, models) ?? models[0]?.id ?? ''

  const setModelId = useCallback(
    (nextModelId: ModelId) => {
      if (!nextModelId || !isAuthenticated) {
        return
      }

      updatePreferences.mutate({ default_model_id: nextModelId })
    },
    [isAuthenticated, updatePreferences],
  )

  return { modelId: resolvedModelId, setModelId }
}

/**
 * 채팅방별 모델 — conversation_settings.model_id + ai_models fallback.
 * 마이페이지 default model과 독립적으로 해당 대화 snapshot만 수정한다.
 */
export function useResolvedConversationModel(
  conversationId: string | null | undefined,
) {
  const { isAuthenticated } = useAuth()
  const { data: settings } = useConversationSettingsQuery(conversationId, {
    enabled: isAuthenticated,
  })
  const { data: models = [] } = useAiModelsQuery()
  const updateSettings = useUpdateConversationSettingsMutation(conversationId)

  const dbModelId = settings?.modelId ?? null
  const resolvedModelId =
    resolveStoredModelId(dbModelId, models) ?? models[0]?.id ?? ''

  const setModelId = useCallback(
    (nextModelId: ModelId) => {
      if (!nextModelId || !conversationId || !isAuthenticated) {
        return
      }

      updateSettings.mutate({ model_id: nextModelId })
    },
    [conversationId, isAuthenticated, updateSettings],
  )

  return { modelId: resolvedModelId, setModelId }
}

/** @deprecated useResolvedDefaultModel 사용 */
export function useDefaultModel() {
  return useResolvedDefaultModel()
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
