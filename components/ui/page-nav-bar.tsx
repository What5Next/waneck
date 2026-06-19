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
}

/** 서브페이지 상단 뒤로가기 + 제목 바 */
export function PageNavBar({
  title,
  onBack,
  className,
  titleClassName,
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
        className="text-foreground"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-5 w-5" />
      </IconButton>
      {title != null && title !== '' ? (
        <span className={cn('text-sm text-muted-foreground', titleClassName)}>
          {title}
        </span>
      ) : null}
    </div>
  )
}
