'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { PanelLeft, PanelLeftClose, Search } from 'lucide-react'

import { NotificationButton } from '@/components/layout/notification-button'
import { UserButton } from '@/components/auth/user-button'
import { useSidebar } from '@/components/layout/sidebar-context'
import { cn } from '@/lib/utils'

function SidebarToggleButton({
  collapsed,
  onClick,
  className,
}: {
  collapsed: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
      aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <PanelLeft className="h-[18px] w-[18px]" />
      ) : (
        <PanelLeftClose className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}

export function Header({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const { collapsed, mobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()

  // 탐색 페이지에서 URL 검색어와 입력창 동기화
  useEffect(() => {
    setQuery(searchParams.get('search') ?? '')
  }, [searchParams])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    const params = new URLSearchParams()
    if (trimmedQuery) params.set('search', trimmedQuery)
    const queryString = params.toString()
    router.push(queryString ? `/characters?${queryString}` : '/characters')
  }

  function handleMobileSearch() {
    router.push('/characters')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 sm:px-5',
        className,
      )}
    >
      {/* 좌측: 사이드바 + 로고 */}
      <div className="flex shrink-0 items-center gap-2">
        <SidebarToggleButton
          collapsed={collapsed}
          onClick={toggleSidebar}
          className="hidden sm:flex"
        />
        <SidebarToggleButton
          collapsed={!mobileOpen}
          onClick={toggleMobileSidebar}
          className="sm:hidden"
        />
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          와넥
        </Link>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        {/* 모바일: 검색 + 알림 */}
        <button
          type="button"
          onClick={handleMobileSearch}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
          aria-label="캐릭터 검색"
        >
          <Search className="h-5 w-5" />
        </button>
        <NotificationButton className="sm:hidden" />

        {/* 데스크톱: 검색창 + 알림 + 프로필 */}
        <form onSubmit={handleSearch} className="hidden min-w-0 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="캐릭터 검색"
              aria-label="캐릭터 검색"
              className="h-9 w-[240px] rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground outline-none transition-[width] placeholder:text-muted-foreground focus:w-[280px] focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        <NotificationButton className="hidden sm:block" />

        <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
          <UserButton />
        </div>
      </div>
    </header>
  )
}
