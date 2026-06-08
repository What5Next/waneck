import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type MobileShellProps = {
  children: ReactNode
  className?: string
}

export function MobileShell({ children, className }: MobileShellProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground mx-auto min-h-screen w-full max-w-[720px] shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
