'use client'

import { useRef, useEffect, useState } from 'react'
import type { KeyboardEventHandler } from 'react'
import { SendHorizonal, Plus, Asterisk, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ModelSelector, type ModelId } from '@/components/chat/model-selector'

export type ChatComposerProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled?: boolean
  model: ModelId
  onModelChange: (model: ModelId) => void
  /** 캐릭터 추천 대화 — 추천 답변 메뉴에 표시 */
  suggestions?: string[]
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  model,
  onModelChange,
  suggestions = [],
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const recommendedReplies = suggestions.filter((text) => text.trim().length > 0)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    if (!disabled && value.trim().length > 0) {
      onSubmit()
    }
  }

  function insertActionMarkers() {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)

    let newValue: string
    let newCursor: number

    if (selected) {
      newValue = value.slice(0, start) + '*' + selected + '*' + value.slice(end)
      newCursor = end + 2
    } else {
      newValue = value.slice(0, start) + '**' + value.slice(start)
      newCursor = start + 1
    }

    onChange(newValue)
    setMenuOpen(false)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  function applyRecommendedReply(text: string) {
    onChange(text)
    setMenuOpen(false)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="shrink-0 bg-background px-3 pb-4 pt-3">
      <div className="rounded-2xl border border-border bg-card">
        <textarea
          ref={textareaRef}
          className="scroll-hide max-h-[120px] w-full resize-none overflow-y-auto bg-transparent px-4 pt-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="메시지를 입력해보세요"
          rows={1}
        />
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                disabled={disabled}
                className="flex h-8 w-8 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                aria-label="추가 기능"
                aria-expanded={menuOpen}
              >
                <Plus className="h-5 w-5" strokeWidth={1.5} />
              </button>

              {menuOpen ? (
                <div className="absolute bottom-full left-0 z-50 mb-1 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <button
                    type="button"
                    onClick={insertActionMarkers}
                    disabled={disabled}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted disabled:opacity-40"
                  >
                    <Asterisk className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-medium text-foreground">행동 묘사</p>
                      <p className="text-[11px] text-muted-foreground">*행동* 형식으로 삽입</p>
                    </div>
                  </button>

                  <div className="border-t border-border" />

                  <div className="px-4 py-3">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <p className="text-[12px] font-semibold text-foreground">추천 답변</p>
                    </div>

                    {recommendedReplies.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {recommendedReplies.map((reply, index) => (
                          <button
                            key={`${reply}-${index}`}
                            type="button"
                            onClick={() => applyRecommendedReply(reply)}
                            disabled={disabled}
                            className="rounded-lg border border-border px-3 py-2 text-left text-[12px] leading-snug text-foreground transition-colors hover:border-primary/30 hover:bg-muted disabled:opacity-40"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">등록된 추천 답변이 없어요</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <ModelSelector value={model} onChange={onModelChange} compact />
          </div>
          <Button
            type="button"
            size="icon"
            className={cn(
              'h-8 w-8 shrink-0 rounded-lg transition-colors',
              canSend
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            disabled={!canSend}
            onClick={onSubmit}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
