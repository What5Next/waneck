'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

import {
  HeaderIconButton,
  headerIconClass,
} from '@/components/layout/header-icon-button'
import { NotificationsPanel } from '@/components/layout/notifications-panel'
import { cn } from '@/lib/utils'

export function NotificationButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={cn('relative z-[100]', className)}>
      <HeaderIconButton
        onClick={() => setIsOpen((prev) => !prev)}
        active={isOpen}
        aria-label="알림"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className={headerIconClass} />
      </HeaderIconButton>

      {isOpen ? <NotificationsPanel /> : null}
    </div>
  )
}
