'use client'

import { useState } from 'react'
import { Inbox } from 'lucide-react'

import { cn } from '@/lib/utils'

type NotificationTab = 'notifications' | 'notices' | 'updates'

const NOTIFICATION_TABS: { id: NotificationTab; label: string }[] = [
  { id: 'notifications', label: '알림' },
  { id: 'notices', label: '공지' },
  { id: 'updates', label: '업데이트' },
]

const EMPTY_MESSAGES: Record<NotificationTab, string> = {
  notifications: '알림이 없습니다',
  notices: '공지가 없습니다',
  updates: '업데이트가 없습니다',
}

type NotificationsPanelProps = {
  className?: string
}

export function NotificationsPanel({ className }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('notifications')

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-[100] mt-2 w-[min(360px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
        className,
      )}
    >
      <div className="p-4">
        <h2 className="mb-4 text-base font-bold text-foreground">알림</h2>

        {/* 탭 */}
        <div className="mb-4 flex rounded-xl bg-muted/30 p-1">
          {NOTIFICATION_TABS.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 빈 상태 */}
        <div className="flex flex-col items-center justify-center py-12">
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[activeTab]}</p>
        </div>
      </div>
    </div>
  )
}
