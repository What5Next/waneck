'use client'

import Link from 'next/link'
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'

import { useCharacterDetailOverlayOptional } from '@/components/characters/character-detail-overlay'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

type CharacterDetailLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  characterId: string
  children: ReactNode
}

/**
 * 모바일: /characters/[id] 라우팅
 * PC: URL 변경 없이 상세 모달 오버레이
 */
export function CharacterDetailLink({
  characterId,
  children,
  className,
  onClick,
  ...linkProps
}: CharacterDetailLinkProps) {
  const isDesktop = useIsDesktop()
  const overlay = useCharacterDetailOverlayOptional()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    // PC + 오버레이 Provider 있을 때만 라우팅 차단
    if (isDesktop && overlay) {
      event.preventDefault()
      overlay.openCharacter(characterId)
    }
  }

  return (
    <Link
      href={`/characters/${characterId}`}
      className={cn(className)}
      onClick={handleClick}
      {...linkProps}
    >
      {children}
    </Link>
  )
}
