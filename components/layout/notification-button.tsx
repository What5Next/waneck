'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

import { NotificationsPanelContent } from '@/components/layout/notifications-panel'
import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuTrigger,
} from '@/components/ui/popover-menu'
import { cn } from '@/lib/utils'

export function NotificationButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <PopoverMenu
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn('z-[100]', className)}
    >
      <PopoverMenuTrigger asChild>
        <IconButton
          active={isOpen}
          aria-label="Notifications"
          aria-haspopup="dialog"
        >
          <Bell className={headerIconClass} />
        </IconButton>
      </PopoverMenuTrigger>

      <PopoverMenuContent
        side="bottom"
        align="end"
        width="xl"
        gap="md"
        className="z-[100]"
      >
        <NotificationsPanelContent />
      </PopoverMenuContent>
    </PopoverMenu>
  )
}
