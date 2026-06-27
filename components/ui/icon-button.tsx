import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        floating:
          'bg-background/90 text-foreground shadow-md hover:bg-background',
      },
      size: {
        xs: 'h-6 w-6 [&_svg]:size-3.5',
        sm: 'h-7 w-7 [&_svg]:size-4',
        md: 'h-8 w-8 [&_svg]:size-4',
        lg: 'h-9 w-9 [&_svg]:size-[18px]',
      },
      shape: {
        round: 'rounded-full',
        square: 'rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'lg',
      shape: 'round',
    },
  },
)

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    /** 선택/활성 상태 (알림·테마 등) */
    active?: boolean
  }

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant, size, shape, active, type = 'button', children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          iconButtonVariants({ variant, size, shape }),
          active && 'bg-muted text-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
IconButton.displayName = 'IconButton'

/** 헤더·툴바 아이콘 공통 크기 (lg IconButton 기본 svg 크기와 동일) */
export const headerIconClass = 'size-[18px] shrink-0'

export { iconButtonVariants }
