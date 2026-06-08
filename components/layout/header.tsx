import Link from 'next/link'
import { Plus } from 'lucide-react'

import { UserButton } from '@/components/auth/user-button'
import { ThemeToggle } from '../chat/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background/95 h-14 px-[20px]">
      <Link href="/">
        <span className="text-lg font-bold tracking-tight text-foreground">채팅AI</span>
      </Link>
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
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  )
}
