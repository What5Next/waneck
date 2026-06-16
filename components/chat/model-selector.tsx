'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: '최신 고성능 모델', shortName: '2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: '빠르고 가벼운 모델', shortName: '2.5 Lite' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', desc: '차세대 기본 모델', shortName: '3 Flash' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: '차세대 경량 모델', shortName: '3.1 Lite' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: '차세대 고성능 모델', shortName: '3.5 Flash' },
] as const

export type ModelId = (typeof MODELS)[number]['id']

interface ModelSelectorProps {
  value: ModelId
  onChange: (model: ModelId) => void
  compact?: boolean
}

export function ModelSelector({ value, onChange, compact = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const current = MODELS.find((model) => model.id === value) ?? MODELS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-1 rounded-lg font-medium text-foreground transition-colors hover:bg-muted',
          compact ? 'px-2 py-1 text-[12px]' : 'px-2.5 py-1.5 text-[13px]',
        )}
      >
        {compact ? current.shortName : current.name}
        <ChevronDown
          className={cn(
            'text-muted-foreground transition-transform',
            compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg',
            compact ? 'bottom-full left-0 mb-1' : 'right-0 top-full mt-1',
          )}
        >
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                onChange(model.id)
                setOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">{model.name}</p>
                <p className="text-[11px] text-muted-foreground">{model.desc}</p>
              </div>
              {value === model.id ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
