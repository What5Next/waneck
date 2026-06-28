import type { AiModel } from '@/lib/types'

/** useDefaultModel 등 sync store에서 모델 목록 참조용 */
let cachedActiveModels: AiModel[] = []

export function setCachedActiveAiModels(models: AiModel[]) {
  cachedActiveModels = models
}

export function getCachedActiveAiModels(): AiModel[] {
  return cachedActiveModels
}

/** compact UI용 짧은 표시명 (예: "Gemini 2.5 Flash" → "2.5 Flash") */
export function getModelShortName(displayName: string): string {
  const trimmed = displayName.trim()
  const withoutPrefix = trimmed.replace(/^gemini\s+/i, '').trim()
  return withoutPrefix || trimmed
}

/**
 * localStorage 값을 ai_models.id로 정규화.
 * - id(uuid) 또는 model_name(레거시) 모두 허용
 */
export function resolveStoredModelId(
  stored: string | null | undefined,
  models: AiModel[],
): string | null {
  if (models.length === 0) {
    return stored?.trim() || null
  }

  const normalizedStored = stored?.trim()
  if (!normalizedStored) {
    return models[0]?.id ?? null
  }

  const matchedById = models.find((model) => model.id === normalizedStored)
  if (matchedById) {
    return matchedById.id
  }

  const matchedByName = models.find(
    (model) => model.model_name === normalizedStored,
  )
  if (matchedByName) {
    return matchedByName.id
  }

  return models[0]?.id ?? null
}

export function findAiModelById(
  models: AiModel[],
  modelId: string | null | undefined,
): AiModel | null {
  if (!modelId) {
    return models[0] ?? null
  }

  return models.find((model) => model.id === modelId) ?? models[0] ?? null
}

/** 채팅 API용 model_name 조회 (uuid 또는 model_name 입력 허용) */
export function resolveModelName(
  modelParam: string | null | undefined,
  models: AiModel[],
): string | null {
  if (!modelParam?.trim()) {
    return models[0]?.model_name ?? null
  }

  const normalized = modelParam.trim()
  const byId = models.find((model) => model.id === normalized)
  if (byId) {
    return byId.model_name
  }

  const byName = models.find((model) => model.model_name === normalized)
  if (byName) {
    return byName.model_name
  }

  return null
}
