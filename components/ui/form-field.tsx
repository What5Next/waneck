import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export const characterFormInputClassName =
  'border-0 bg-muted/45 px-3 py-2.5 text-base shadow-none focus:ring-0 dark:bg-muted/25'

export const characterFormDescriptionClassName = 'text-sm leading-relaxed text-muted-foreground'

export function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <p className="mb-1.5 text-base font-semibold text-foreground">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </p>
  )
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <Label required={required}>{label}</Label>
      {hint && <p className="mb-2 text-[13px] leading-relaxed text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className={cn(characterFormInputClassName, maxLength !== undefined && 'pr-16')}
      />
      {maxLength !== undefined ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </div>
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
}) {
  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          characterFormInputClassName,
          'scroll-thumb-only max-h-52 overflow-y-auto',
          maxLength !== undefined && 'pb-8',
        )}
      />
      {maxLength !== undefined ? (
        <span className="pointer-events-none absolute bottom-3 right-3 text-[11px] tabular-nums text-muted-foreground/70">
          {value.length.toLocaleString('en-US')}/{maxLength.toLocaleString('en-US')}
        </span>
      ) : null}
    </div>
  )
}
