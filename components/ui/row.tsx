'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface RowContentProps {
  icon: ReactNode
  label: string
  value?: string
  trailing?: ReactNode
  showChevron?: boolean
}

function RowContent({
  icon,
  label,
  value,
  trailing,
  showChevron = true,
}: RowContentProps) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="shrink-0 text-muted-foreground">{icon}</div>
        <p className="text-sm font-medium text-foreground/90">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {value ? (
          <span className="max-w-[140px] truncate text-xs text-muted-foreground/60">
            {value}
          </span>
        ) : null}
        {trailing}
        {showChevron && !trailing ? (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden />
        ) : null}
      </div>
    </>
  )
}

const rowClass =
  'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 transition-colors hover:bg-muted/30'

/** 아이콘 + 라벨 + trailing 행 (버튼) */
export function Row({
  icon,
  label,
  value,
  onClick,
  trailing,
  showChevron = true,
  interactive = true,
  className,
}: RowContentProps & {
  onClick?: () => void
  /** false면 div (Switch 등 중첩 컨트롤용) */
  interactive?: boolean
  className?: string
}) {
  const content = (
    <RowContent
      icon={icon}
      label={label}
      value={value}
      trailing={trailing}
      showChevron={showChevron}
    />
  )

  if (!interactive) {
    return <div className={cn(rowClass, className)}>{content}</div>
  }

  return (
    <button type="button" onClick={onClick} className={cn(rowClass, className)}>
      {content}
    </button>
  )
}

/** 아이콘 + 라벨 + trailing 행 (링크) */
export function RowLink({
  href,
  icon,
  label,
  value,
  external = false,
  className,
}: RowContentProps & {
  href: string
  external?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(rowClass, className)}
    >
      <RowContent icon={icon} label={label} value={value} showChevron />
    </Link>
  )
}
