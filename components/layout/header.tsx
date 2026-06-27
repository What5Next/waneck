'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { PanelLeft, PanelLeftClose, Search, Gem } from 'lucide-react'

import { MobileSearchDialog } from '@/components/layout/mobile-search-dialog'
import { NotificationButton } from '@/components/layout/notification-button'
import { UserButton } from '@/components/auth/user-button'
import { useSidebar } from '@/components/layout/sidebar-context'
import { IconButton, headerIconClass } from '@/components/ui/icon-button'
import { SearchInput } from '@/components/ui/search-input'
import { useProfileQuery } from '@/hooks/queries/use-profile-query'
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
    <IconButton
      onClick={onClick}
      className={className}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <PanelLeft className={headerIconClass} />
      ) : (
        <PanelLeftClose className={headerIconClass} />
      )}
    </IconButton>
  )
}

export function Header({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('search') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const [committedUrlQuery, setCommittedUrlQuery] = useState(urlQuery)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { collapsed, mobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()
  const { data: profile } = useProfileQuery()

  // URL 검색어가 바뀌면 입력창 동기화 (React 권장 derived state 패턴)
  if (committedUrlQuery !== urlQuery) {
    setCommittedUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

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
          Waneck
        </Link>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-1">
        {/* 모바일: 검색 + 알림 */}
        <IconButton
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden"
          aria-label="Search characters"
        >
          <Search className={headerIconClass} />
        </IconButton>
        <MobileSearchDialog
          open={mobileSearchOpen}
          onOpenChange={setMobileSearchOpen}
        />
        <NotificationButton className="sm:hidden" />

        <Link
          href="/won"
          className="flex h-9 items-center gap-1.5 rounded-full px-2 text-foreground transition-colors hover:bg-muted"
          aria-label="Top up won"
        >
          <Gem className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-medium tabular-nums">{(profile?.token_balance ?? 0).toLocaleString("ko-KR")}</span>
        </Link>

        {/* 데스크톱: 검색창 + 알림 + 프로필 */}
        <form onSubmit={handleSearch} className="mr-1 hidden min-w-0 sm:block">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            expandOnFocus
            aria-label="Search characters"
          />
        </form>

        <NotificationButton className="hidden sm:block" />

        <div className="hidden shrink-0 sm:flex">
          <UserButton />
        </div>
      </div>
    </header>
  )
}
