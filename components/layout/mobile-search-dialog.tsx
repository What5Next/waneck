'use client'

import { FormEvent, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { SearchInput } from '@/components/ui/search-input'

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet-top" aria-describedby={undefined}>
        <DialogTitle className="sr-only">캐릭터 검색</DialogTitle>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <SearchInput
            ref={searchInputRef}
            size="md"
            defaultValue=""
            onChange={(event) => {
              queryRef.current = event.target.value
            }}
            enterKeyHint="search"
            containerClassName="flex-1"
            aria-label="캐릭터 검색"
          />

          <DialogClose
            type="button"
            className="flex h-11 shrink-0 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            취소
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  )
}
