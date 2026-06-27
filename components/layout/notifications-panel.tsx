'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'

import { EmptyState } from '@/components/ui/empty-state'
import { SegmentedControl } from '@/components/ui/segmented-control'

type NotificationTab = 'notifications' | 'notices' | 'updates'

const NOTIFICATION_OPTIONS = [
  { value: 'notifications' as const, label: '알림' },
  { value: 'notices' as const, label: '공지' },
  { value: 'updates' as const, label: '업데이트' },
]

const EMPTY_MESSAGES: Record<NotificationTab, string> = {
  notifications: '알림이 없습니다',
  notices: '공지가 없습니다',
  updates: '업데이트가 없습니다',
}

/** PopoverMenuContent 내부 콘텐츠 */
export function NotificationsPanelContent() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('notifications')

  return (
    <>
      <h2 className="mb-4 text-base font-bold text-foreground">알림</h2>

      <SegmentedControl
        value={activeTab}
        onValueChange={setActiveTab}
        options={NOTIFICATION_OPTIONS}
        shape="rounded"
        layout="equal"
        className="mb-4 w-full"
        aria-label="알림 종류"
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
