'use client'

import { useRef, useEffect } from 'react'
import type { KeyboardEventHandler } from 'react'
import { SendHorizonal, Asterisk } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type ChatComposerProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function ChatComposer({ value, onChange, onSubmit, disabled = false }: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newCursor, newCursor)
    })
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="shrink-0 bg-background px-3 pb-4 pt-3">
      <div className="rounded-2xl border border-border bg-card">
        <textarea
          ref={textareaRef}
          className="max-h-[120px] w-full resize-none overflow-y-auto bg-transparent px-4 pt-3 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="메시지를 입력해보세요"
          rows={1}
        />
        <div className="flex items-center justify-between p-2">
          <button
            type="button"
            onClick={insertActionMarkers}
            disabled={disabled}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 border"
            aria-label="행동 묘사 삽입"
          >
            <Asterisk className="h-6 w-6" strokeWidth={1} />
          </button>
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
