import Link from 'next/link'
import { Plus } from 'lucide-react'

import { UserButton } from '@/components/auth/user-button'

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <span className="text-lg font-bold tracking-tight text-foreground">채팅AI</span>
      <div className="flex items-center gap-0.5">
        <Link
          href="/characters/create"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="캐릭터 만들기"
        >
          <Plus className="h-5 w-5 text-muted-foreground" />
        </Link>
        {/* <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="검색"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </button> */}
        {/* <ThemeToggle /> */}
        <UserButton />
      </div>
    </header>
  )
}
