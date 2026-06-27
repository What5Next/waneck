'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/ui/empty-state'
import { SegmentedControl } from '@/components/ui/segmented-control'

type NotificationTab = 'notifications' | 'notices' | 'updates'

const NOTIFICATION_OPTIONS = [
  { value: 'notifications' as const, label: 'Notifications' },
  { value: 'notices' as const, label: 'Notices' },
  { value: 'updates' as const, label: 'Updates' },
]

const EMPTY_MESSAGES: Record<NotificationTab, string> = {
  notifications: 'No notifications',
  notices: 'No notices',
  updates: 'No updates',
}

/** PopoverMenuContent 내부 콘텐츠 */
export function NotificationsPanelContent() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('notifications')

  return (
    <>
      <h2 className="mb-4 text-base font-bold text-foreground">Notifications</h2>

      <SegmentedControl
        value={activeTab}
        onValueChange={setActiveTab}
        options={NOTIFICATION_OPTIONS}
        shape="rounded"
        layout="equal"
        className="mb-4 w-full"
        aria-label="Notification type"
      />

      <EmptyState
        message={EMPTY_MESSAGES[activeTab]}
        icon={Inbox}
        className="py-12"
        iconClassName="mb-1 h-10 w-10 text-muted-foreground/40"
        messageClassName="text-sm"
      />
    </>
  )
}
