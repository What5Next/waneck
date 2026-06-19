'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FormEvent, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'

interface MobileSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSearchDialog({
  open,
  onOpenChange,
}: MobileSearchDialogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const queryRef = useRef('')

  // 다이얼로그 열릴 때 URL 검색어와 입력창 동기화 + 자동 포커스
  useEffect(() => {
    if (!open) return

    queryRef.current = searchParams.get('search') ?? ''
    if (searchInputRef.current) {
      searchInputRef.current.value = queryRef.current
    }

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)

    return () => window.clearTimeout(focusTimer)
  }, [open, searchParams])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = queryRef.current.trim()
    const params = new URLSearchParams()
    if (trimmedQuery) params.set('search', trimmedQuery)
    const queryString = params.toString()
    router.push(queryString ? `/characters?${queryString}` : '/characters')
    onOpenChange(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-0 top-0 z-50 border-b border-border bg-background px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          )}
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            캐릭터 검색
          </DialogPrimitive.Title>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                defaultValue=""
                onChange={(event) => {
                  queryRef.current = event.target.value
                }}
                placeholder="캐릭터 검색"
                aria-label="캐릭터 검색"
                enterKeyHint="search"
                className="h-11 w-full rounded-full bg-muted/50 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <DialogPrimitive.Close
              type="button"
              className="flex h-11 shrink-0 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              취소
            </DialogPrimitive.Close>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
