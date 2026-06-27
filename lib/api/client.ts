/**
 * 클라이언트 API fetch 공통 레이어.
 * - 모든 /api/* 호출은 이 모듈을 통해 일관된 에러 처리를 받는다.
 * - TanStack Query의 queryFn / mutationFn에서 사용한다.
 */

/** HTTP 상태 코드를 포함하는 API 에러 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** 응답 본문에서 사용자에게 보여줄 에러 메시지 추출 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }
    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error
    }
  } catch {
    // JSON이 아닌 응답(HTML 에러 페이지 등)은 statusText로 대체
  }

  return response.statusText || 'Request failed'
}

/**
 * 타입 안전 fetch 래퍼.
 * @throws {ApiError} response.ok가 false일 때
 */
export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init)

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}
