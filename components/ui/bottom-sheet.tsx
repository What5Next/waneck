'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ComponentProps, ReactNode } from 'react'

import { useBottomSheetDrag } from '@/hooks/use-bottom-sheet-drag'
import { cn } from '@/lib/utils'

import { DialogOverlay, DialogPortal } from '@/components/ui/dialog'

type BottomSheetContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  open: boolean
  onDismiss: () => void
  children: ReactNode
}

export function BottomSheetContent({
  open,
  onDismiss,
  children,
  className,
  ...props
}: BottomSheetContentProps) {
  const { isDragging, contentStyle, dragHandleProps } = useBottomSheetDrag({
    open,
    onDismiss,
  })

  return (
    <DialogPortal>
      <DialogOverlay variant="sheet-bottom" />
      <DialogPrimitive.Content
        className={cn(
          'sheet-bottom-dialog fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl',
          isDragging && 'sheet-bottom-dialog--dragging',
          className,
        )}
        style={contentStyle}
        {...props}
      >
        <div
          className="flex shrink-0 touch-none select-none flex-col items-center px-4 pt-3 pb-2 cursor-grab active:cursor-grabbing"
          role="separator"
          aria-label="Drag to resize bottom sheet"
          {...dragHandleProps}
        >
          <div
            className="h-1 w-10 rounded-full bg-muted-foreground/25"
            aria-hidden
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}
