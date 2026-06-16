'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { PanelLeft, PanelLeftClose, Search } from 'lucide-react'

import { UserButton } from '@/components/auth/user-button'
import { ThemeToggle } from '@/components/chat/theme-toggle'
import { useSidebar } from '@/components/layout/sidebar-context'
import { cn } from '@/lib/utils'

export function Header({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const { collapsed, toggleSidebar } = useSidebar()

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
        'sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 sm:px-5',
        className,
      )}
    >
      {/* 데스크톱: 펼치기 버튼 + 타이틀 */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          와넥
        </Link>
      </div>

      {/* 모바일: 사이드바 없을 때 로고 */}
      <Link href="/" className="shrink-0 sm:hidden">
        <span className="text-lg font-bold tracking-tight text-foreground">와넥</span>
      </Link>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        {/* 검색창 */}
        <form onSubmit={handleSearch} className="min-w-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="캐릭터 검색"
              aria-label="캐릭터 검색"
              className="h-9 w-[140px] rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground outline-none transition-[width] placeholder:text-muted-foreground focus:w-[200px] focus:border-primary focus:ring-1 focus:ring-primary xs:w-[180px] xs:focus:w-[240px] sm:w-[240px] sm:focus:w-[280px]"
            />
          </div>
        </form>

        {/* 프로필 · 테마 (모바일과 동일 동작) */}
        <div className="flex shrink-0 items-center gap-0.5">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
