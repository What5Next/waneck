import * as React from 'react'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** sm: h-9 (헤더), md: h-11 (모바일 다이얼로그) */
  size?: 'sm' | 'md'
  /** 포커스 시 너비 확장 (데스크톱 헤더) */
  expandOnFocus?: boolean
  containerClassName?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      size = 'sm',
      expandOnFocus = false,
      placeholder = '캐릭터 검색',
      ...props
    },
    ref,
  ) => {
    const iconLeft = size === 'md' ? 'left-3.5' : 'left-3'

    return (
      <div className={cn('relative min-w-0', containerClassName)}>
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
            iconLeft,
          )}
          aria-hidden
        />
        <Input
          ref={ref}
          type="search"
          variant="search"
          inputSize={size}
          placeholder={placeholder}
          className={cn(
            size === 'sm' && 'w-[240px]',
            size === 'sm' && expandOnFocus && 'transition-[width] focus:w-[280px]',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'
