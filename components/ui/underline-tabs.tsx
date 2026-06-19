'use client'

import { cn } from '@/lib/utils'

export interface UnderlineTabOption<T extends string> {
  value: T
  label: string
}

interface UnderlineTabsProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: UnderlineTabOption<T>[]
  className?: string
  listClassName?: string
}

/** 프로필 등 underline indicator 탭 */
export function UnderlineTabs<T extends string>({
  value,
  onValueChange,
  options,
  className,
  listClassName,
}: UnderlineTabsProps<T>) {
  return (
    <div className={cn('border-b border-border', className)}>
      <div
        role="tablist"
        className={cn('flex justify-center gap-8', listClassName)}
      >
        {options.map((option) => {
          const isActive = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onValueChange(option.value)}
              className={cn(
                'relative pb-3 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
