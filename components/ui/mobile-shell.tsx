import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type MobileShellProps = {
  children: ReactNode
  className?: string
}

/** iPhone 12 mini 폭(375px) 단일 컬럼 셸 */
export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground mx-auto min-h-screen w-full max-w-[375px] shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
