'use client'

import type { KeyboardEventHandler } from 'react'
import { SendHorizonal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type ChatComposerProps = {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function ChatComposer({ value, onChange, onSubmit, disabled = false }: ChatComposerProps) {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    if (!disabled && value.trim().length > 0) {
      onSubmit()
    }
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="shrink-0 bg-background px-3 pb-4 pt-3">
      <div className="flex items-end gap-2">
        <textarea
          className="flex min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="메시지를 입력해보세요"
          rows={1}
        />
        <Button
          type="button"
          size="icon"
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl transition-colors',
            canSend
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
          disabled={!canSend}
          onClick={onSubmit}
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
