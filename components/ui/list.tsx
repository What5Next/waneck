import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const listSurfaceClass = 'space-y-0.5 rounded-2xl bg-muted/15 p-1.5'

/** RowPanel 내부 Row — p-1.5(6px) + px-3(12px) 보상 */
const rowPanelRowClass =
  '[&>*]:min-h-14 [&>*]:rounded-none [&>*]:px-[1.125rem]'

interface ListProps {
  children: ReactNode
  /** 섹션 제목 (선택) */
  title?: string
  className?: string
}

/** Row 여러 개 + 선택적 제목 */
export function List({ title, children, className }: ListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {title ? (
        <h3 className="px-1 text-xs font-medium text-muted-foreground">{title}</h3>
      ) : null}
      <div className={listSurfaceClass}>{children}</div>
    </div>
  )
}

interface RowPanelProps {
  children: ReactNode
  className?: string
}

/** Row 1개용 muted 배경 패널 */
export function RowPanel({ children, className }: RowPanelProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-muted/15', rowPanelRowClass, className)}>
      {children}
    </div>
  )
}
