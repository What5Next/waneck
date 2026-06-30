'use client'

import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'

interface PageNavBarProps {
  title?: ReactNode
  onBack: () => void
  className?: string
  titleClassName?: string
  trailing?: ReactNode
}

/** 서브페이지 상단 뒤로가기 + 제목 바 */
export function PageNavBar({
  title,
  onBack,
  className,
  titleClassName,
  trailing,
}: PageNavBarProps) {
  return (
    <div
      className={cn(
        'flex h-12 shrink-0 items-center gap-2 border-b border-border px-4',
        className,
      )}
    >
      <IconButton
        size="md"
        shape="square"
        onClick={onBack}
        className="shrink-0 text-foreground"
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </IconButton>
      {title != null && title !== '' ? (
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-sm text-muted-foreground',
            titleClassName,
          )}
        >
          {title}
        </span>
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      {trailing}
    </div>
  )
}
