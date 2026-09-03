'use client'

import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/ui/empty-state'

/** PopoverMenuContent 내부 콘텐츠 */
export function NotificationsPanelContent() {
  return (
    <>
      <h2 className="mb-4 text-base font-bold text-foreground">Notifications</h2>

      <EmptyState
        message="No notifications"
        icon={Inbox}
        className="py-12"
        iconClassName="mb-1 h-10 w-10 text-muted-foreground/40"
        messageClassName="text-sm"
      />
    </>
  )
}
