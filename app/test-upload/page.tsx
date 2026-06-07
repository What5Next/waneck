'use client'

import { useRef, useState } from 'react'

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; url: string }
  | { status: 'error'; message: string }

export default function TestUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setState({ status: 'idle' })
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setState({ status: 'uploading' })
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      let data: Record<string, string> = {}
      try { data = await res.json() } catch { /* empty body */ }

      if (!res.ok) throw new Error(data.error ?? `업로드 실패 (HTTP ${res.status})`)
      setState({ status: 'success', url: data.publicUrl })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : '알 수 없는 오류' })
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-8">
      <h1 className="text-xl font-bold">S3 업로드 테스트</h1>

      {/* 파일 선택 */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-muted-foreground hover:border-ring hover:text-foreground"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <>
            <span className="text-4xl">📁</span>
            <span className="text-sm">클릭해서 이미지 선택</span>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>

      {/* 업로드 버튼 */}
      <button
        onClick={handleUpload}
        disabled={!preview || state.status === 'uploading'}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        {state.status === 'uploading' ? '업로드 중...' : 'S3에 업로드'}
      </button>

      {/* 결과 */}
      {state.status === 'success' && (
        <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-green-500">✓ 업로드 성공</p>
          <img src={state.url} alt="uploaded" className="max-h-48 rounded-lg object-contain" />
          <a
            href={state.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-xs text-blue-400 underline"
          >
            {state.url}
          </a>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">✗ 오류</p>
          <p className="mt-1 text-xs text-destructive/80">{state.message}</p>
        </div>
      )}
    </div>
  )
}
