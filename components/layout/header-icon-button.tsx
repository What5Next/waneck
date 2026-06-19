import * as React from 'react'

import { cn } from '@/lib/utils'

/** 헤더 액션 아이콘 버튼 공통 스타일 */
export const headerIconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50'

/** 헤더 액션 아이콘 공통 크기 */
export const headerIconClass = 'size-[18px] shrink-0'

export function HeaderIconButton({
  className,
  active,
  children,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}) {
  return (
    <button
      type={type}
      className={cn(
        headerIconButtonClass,
        active && 'bg-muted text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
