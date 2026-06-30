'use client'

import { Flag, MoreVertical, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { IconButton } from '@/components/ui/icon-button'
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTrigger,
  usePopoverMenu,
} from '@/components/ui/popover-menu'
import { cn } from '@/lib/utils'

type CharacterDetailHeaderMenuProps = {
  characterId: string
  characterName: string
  className?: string
}

function CharacterDetailHeaderMenuPanel({
  characterId,
  characterName,
}: Pick<CharacterDetailHeaderMenuProps, 'characterId' | 'characterName'>) {
  const { setOpen } = usePopoverMenu()

  async function handleShare() {
    if (typeof window === 'undefined') return

    const shareUrl = `${window.location.origin}/characters/${characterId}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${characterName} | Waneck`,
          url: shareUrl,
        })
        setOpen(false)
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied.')
      setOpen(false)
    } catch {
      // 공유 취소·권한 거부는 무시
    }
  }

  function handleReport() {
    setOpen(false)
    toast.message('Reporting is coming soon.')
  }

  return (
    <PopoverMenuContent
      side="bottom"
      align="end"
      width="auto"
      padded={false}
      className="min-w-0"
    >
      <div className="p-1">
        <PopoverMenuItem
          icon={<Share2 className="h-4 w-4" />}
          label="Share"
          className="whitespace-nowrap px-2.5 py-2"
          onClick={() => void handleShare()}
        />
        <PopoverMenuItem
          icon={<Flag className="h-4 w-4" />}
          label="Report"
          className="whitespace-nowrap px-2.5 py-2"
          onClick={handleReport}
        />
      </div>
    </PopoverMenuContent>
  )
}

export function CharacterDetailHeaderMenu({
  characterId,
  characterName,
  className,
}: CharacterDetailHeaderMenuProps) {
  return (
    <PopoverMenu className={cn('shrink-0 -mr-0.5', className)}>
      <PopoverMenuTrigger asChild>
        <IconButton
          size="md"
          shape="square"
          aria-label="More options"
          className="shrink-0 text-foreground"
        >
          <MoreVertical className="h-5 w-5" />
        </IconButton>
      </PopoverMenuTrigger>
      <CharacterDetailHeaderMenuPanel
        characterId={characterId}
        characterName={characterName}
      />
    </PopoverMenu>
  )
}
