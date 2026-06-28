'use client'

import { useRouter } from 'next/navigation'

import { CharacterDetail } from '@/components/character-detail'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { CharacterWithDetail } from '@/lib/types'
import { cn } from '@/lib/utils'

type CharacterDetailModalProps = {
  character: CharacterWithDetail
  /** overlay: URL 변경 없이 닫기, route: router.back/push (직접 URL 진입) */
  closeMode?: 'overlay' | 'route'
  onClose?: () => void
}

export function CharacterDetailModal({
  character,
  closeMode = 'route',
  onClose,
}: CharacterDetailModalProps) {
  const router = useRouter()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (closeMode === 'overlay') {
        onClose?.()
        return
      }

      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back()
        return
      }
      router.push('/characters')
    }
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        showClose
        className={cn(
          'left-1/2 top-1/2 flex h-[min(80dvh,1200px)] w-[min(80dvw,800px)] max-w-none -translate-x-1/2 -translate-y-1/2',
          'overflow-hidden rounded-2xl border border-border bg-background p-0 shadow-2xl',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        )}
      >
        <DialogTitle className="sr-only">{character.name}</DialogTitle>
        <CharacterDetail character={character} onStartChat={onClose} />
      </DialogContent>
    </Dialog>
  )
}
