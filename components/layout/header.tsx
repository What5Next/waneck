'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { PanelLeft, PanelLeftClose, Search, Gem } from 'lucide-react'

import { MobileSearchDialog } from '@/components/layout/mobile-search-dialog'
import {
  HeaderIconButton,
  headerIconClass,
} from '@/components/layout/header-icon-button'
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
    <HeaderIconButton
      onClick={onClick}
      className={className}
      aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <PanelLeft className={headerIconClass} />
      ) : (
        <PanelLeftClose className={headerIconClass} />
      )}
    </HeaderIconButton>
  )
}

export function Header({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-background px-4 sm:px-5',
        className,
      )}
    >
      {/* 좌측: 사이드바 + 로고 */}
      <div className="flex shrink-0 items-center gap-1">
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

      <div className="ml-auto flex min-w-0 items-center gap-1">
        {/* 모바일: 검색 + 알림 */}
        <HeaderIconButton
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden"
          aria-label="캐릭터 검색"
        >
          <Search className={headerIconClass} />
        </HeaderIconButton>
        <MobileSearchDialog
          open={mobileSearchOpen}
          onOpenChange={setMobileSearchOpen}
        />
        <NotificationButton className="sm:hidden" />

        <Link
          href="/won"
          className="flex h-9 items-center gap-1.5 rounded-full px-2 text-foreground transition-colors hover:bg-muted"
          aria-label="won 충전"
        >
          <Gem className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-medium tabular-nums">0</span>
        </Link>

        {/* 데스크톱: 검색창 + 알림 + 프로필 */}
        <form onSubmit={handleSearch} className="mr-1 hidden min-w-0 sm:block">
          <div className="relative">
            <Search className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground', headerIconClass)} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="캐릭터 검색"
              aria-label="캐릭터 검색"
              className="h-9 w-[240px] rounded-full bg-muted/50 pl-10 pr-3 text-sm text-foreground outline-none transition-[width] placeholder:text-muted-foreground focus:w-[280px] focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>

        <NotificationButton className="hidden sm:block" />

        <div className="hidden shrink-0 sm:flex">
          <UserButton />
        </div>
      </div>
    </header>
  )
}
