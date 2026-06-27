import type { ReactNode } from 'react'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function Label({ children, required }: { children: string; required?: boolean }) {
  return (
    <p className="mb-1.5 text-sm font-medium text-foreground">
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
    <div className="flex flex-col gap-0">
      <Label required={required}>{label}</Label>
      {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
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
      />
      {maxLength !== undefined ? (
        <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-muted-foreground">
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
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
      />
      {maxLength !== undefined ? (
        <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </span>
      ) : null}
    </div>
  )
}
