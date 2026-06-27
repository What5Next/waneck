import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const chipVariants = cva(
  'shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      selected: {
        true: 'bg-primary text-primary-foreground',
        false: 'bg-inactive text-inactive-foreground hover:bg-inactive-hover hover:text-inactive-hover-foreground',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof chipVariants>

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected ?? false}
        className={cn(chipVariants({ selected }), className)}
        {...props}
      />
    )
  },
)
Chip.displayName = 'Chip'

export { chipVariants }
