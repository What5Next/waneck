'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export const MODELS = [
  { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash',      desc: '최신 고성능 모델' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: '빠르고 가벼운 모델' },
  { id: 'gemini-3-flash',        name: 'Gemini 3 Flash',        desc: '차세대 기본 모델' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: '차세대 경량 모델' },
  { id: 'gemini-3.5-flash',      name: 'Gemini 3.5 Flash',      desc: '차세대 고성능 모델' },
] as const

export type ModelId = (typeof MODELS)[number]['id']

export function ModelSelector({
  value,
  onChange,
}: {
  value: ModelId
  onChange: (model: ModelId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const current = MODELS.find((m) => m.id === value) ?? MODELS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
      >
        {current.name}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => { onChange(model.id); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">{model.name}</p>
                <p className="text-[11px] text-muted-foreground">{model.desc}</p>
              </div>
              {value === model.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
