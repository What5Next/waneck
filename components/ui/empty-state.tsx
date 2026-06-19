import type { LucideIcon } from 'lucide-react'
import { Ghost } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** 빈 상태 안내 문구 */
  message: ReactNode
  /** 아이콘 (미지정 시 Ghost) */
  icon?: LucideIcon
  className?: string
  iconClassName?: string
  messageClassName?: string
}

export function EmptyState({
  message,
  icon: Icon = Ghost,
  className,
  iconClassName,
  messageClassName,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 text-center',
        className,
      )}
    >
      <Icon
        className={cn('h-8 w-8 shrink-0 text-muted-foreground/50', iconClassName)}
        aria-hidden
      />
      <div
        className={cn(
          'max-w-xs px-3 text-[12px] leading-tight text-muted-foreground',
          messageClassName,
        )}
      >
        {message}
      </div>
    </div>
  )
}
