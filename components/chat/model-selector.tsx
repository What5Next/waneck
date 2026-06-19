'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTrigger,
  usePopoverMenu,
} from '@/components/ui/popover-menu'
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

function ModelMenuItems({
  value,
  onChange,
}: {
  value: ModelId
  onChange: (model: ModelId) => void
}) {
  const { setOpen } = usePopoverMenu()

  return (
    <>
      {MODELS.map((model) => (
        <PopoverMenuItem
          key={model.id}
          label={model.name}
          description={model.desc}
          selected={value === model.id}
          onClick={() => {
            onChange(model.id)
            setOpen(false)
          }}
        />
      ))}
    </>
  )
}

export function ModelSelector({ value, onChange, compact = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const current = MODELS.find((model) => model.id === value) ?? MODELS[0]

  return (
    <PopoverMenu open={open} onOpenChange={setOpen}>
      <PopoverMenuTrigger
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
          aria-hidden
        />
      </PopoverMenuTrigger>

      <PopoverMenuContent
        side={compact ? 'top' : 'bottom'}
        align={compact ? 'start' : 'end'}
        width="md"
        padded={false}
      >
        <div className="p-1.5">
          <ModelMenuItems value={value} onChange={onChange} />
        </div>
      </PopoverMenuContent>
    </PopoverMenu>
  )
}
