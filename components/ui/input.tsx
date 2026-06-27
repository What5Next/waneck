import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full outline-none transition-colors focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-xl border border-border bg-card px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:ring-ring',
        search:
          'rounded-full bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:ring-primary',
      },
      inputSize: {
        default: '',
        sm: 'h-9 pl-10 pr-3',
        md: 'h-11 pl-10 pr-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  },
)

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
  VariantProps<typeof inputVariants>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { inputVariants }
