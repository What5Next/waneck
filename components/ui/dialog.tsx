import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const dialogContentVariants = cva('fixed z-50', {
  variants: {
    variant: {
      center:
        'left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card bg-background p-8 shadow-2xl data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'sheet-top':
        'inset-x-0 top-0 border-b border-border bg-background px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'sheet-bottom':
        'sheet-bottom-dialog inset-x-0 bottom-0 flex max-h-[min(92dvh,720px)] flex-col rounded-t-2xl border-t border-border bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl',
    },
  },
  defaultVariants: {
    variant: 'center',
  },
})

type DialogVariant = NonNullable<VariantProps<typeof dialogContentVariants>['variant']>

function DialogOverlay({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  variant?: DialogVariant
}) {
  const isSheetBottom = variant === 'sheet-bottom'

  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/60',
        isSheetBottom
          ? 'sheet-bottom-overlay'
          : 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants> & {
    /** center variant 기본 X 닫기 버튼 표시 */
    showClose?: boolean
  }

function DialogContent({
  className,
  children,
  variant = 'center',
  showClose,
  ...props
}: DialogContentProps) {
  const shouldShowClose = showClose ?? variant === 'center'

  return (
    <DialogPortal>
      <DialogOverlay variant={variant ?? undefined} />
      <DialogPrimitive.Content
        className={cn(dialogContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {shouldShowClose ? (
          <DialogClose className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)} {...props} />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-xl font-bold text-foreground', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
}
