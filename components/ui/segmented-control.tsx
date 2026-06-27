import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: ReactNode
  icon?: LucideIcon
  /** iconOnly일 때 접근성 라벨 */
  'aria-label'?: string
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  /** sm: h-8, md: h-9 */
  size?: 'sm' | 'md'
  /** pill: rounded-full, rounded: rounded-xl track + rounded-lg segment */
  shape?: 'pill' | 'rounded'
  /** equal: flex-1 균등 너비 (알림 패널 등) */
  layout?: 'auto' | 'equal'
  /** grid-cols-N (정렬 탭 3열 등) */
  columns?: number
  iconOnly?: boolean
  className?: string
  'aria-label': string
}

const columnClass: Record<number, string> = {
  2: 'grid grid-cols-2',
  3: 'grid grid-cols-3',
  4: 'grid grid-cols-4',
}

const trackShapeClass = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
} as const

const segmentShapeClass = {
  pill: 'rounded-full',
  rounded: 'rounded-lg',
} as const

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  size = 'sm',
  shape = 'pill',
  layout = 'auto',
  columns,
  iconOnly = false,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  const trackHeight = size === 'md' ? 'h-9' : 'h-8'

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'shrink-0 gap-1 bg-muted/30 p-1',
        columns !== undefined ? columnClass[columns] : 'flex w-fit',
        trackHeight,
        trackShapeClass[shape],
        layout === 'equal' && 'w-full',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={option['aria-label']}
            aria-pressed={iconOnly ? isActive : undefined}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'flex items-center justify-center font-medium whitespace-nowrap transition-all',
              segmentShapeClass[shape],
              layout === 'equal' && 'flex-1',
              iconOnly
                ? cn('size-6', size === 'md' && 'size-7')
                : cn(
                    shape === 'pill'
                      ? 'gap-1.5 px-2 py-1.5 text-[12px]'
                      : 'px-2 py-2 text-sm',
                  ),
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon ? (
              <Icon
                className={cn('shrink-0', iconOnly ? 'size-3.5' : 'size-3')}
                aria-hidden
              />
            ) : null}
            {!iconOnly ? (
              <span className={Icon ? 'leading-none' : undefined}>{option.label}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
