'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, MoreVertical } from 'lucide-react'

interface ChatHeaderProps {
  characterId: string
  characterName: string
}

export function ChatHeader({ characterId, characterName }: ChatHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <header className="relative sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-[20px]">
      <Link
        href={`/characters/${characterId}`}
        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-muted"
        aria-label="캐릭터 상세로 돌아가기"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </Link>

      <h1 className="pointer-events-none absolute left-1/2 max-w-[calc(100%-96px)] -translate-x-1/2 truncate text-center text-[15px] font-medium text-foreground">
        {characterName}
      </h1>

      <div ref={menuRef} className="relative z-10 ml-auto shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="더보기"
          aria-expanded={menuOpen}
        >
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <p className="px-4 py-3 text-[13px] text-muted-foreground">메뉴 준비 중</p>
          </div>
        ) : null}
      </div>
    </header>
  )
}
