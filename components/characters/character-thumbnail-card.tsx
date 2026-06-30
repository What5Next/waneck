'use client'

import type { ReactNode } from 'react'
import { Heart, MessageCircle, MessageSquare } from 'lucide-react'

import { formatCompactCount } from '@/lib/character-display'
import { cn } from '@/lib/utils'

type CharacterThumbnailStatsProps = {
  messageCount: number
  likeCount: number
  commentCount: number
  size?: 'sm' | 'md'
  className?: string
}

function CharacterThumbnailStats({
  messageCount,
  likeCount,
  commentCount,
  size = 'md',
  className,
}: CharacterThumbnailStatsProps) {
  const isSmall = size === 'sm'

  const stats = [
    { key: 'messages', icon: MessageCircle, value: messageCount },
    { key: 'likes', icon: Heart, value: likeCount },
    { key: 'comments', icon: MessageSquare, value: commentCount },
  ] as const

  return (
    <div
      className={cn(
        'absolute z-2 flex items-center rounded-full bg-black/55 font-medium text-white backdrop-blur-sm',
        isSmall
          ? 'bottom-1.5 right-1.5 gap-1.5 px-1.5 py-0.5 text-[9px]'
          : 'bottom-3 right-3 gap-2.5 px-3 py-1.5 text-xs',
        className,
      )}
    >
      {stats.map(({ key, icon: Icon, value }) => (
        <span key={key} className="flex items-center gap-1">
          <Icon className={cn(isSmall ? 'size-2.5' : 'h-3.5 w-3.5')} aria-hidden />
          {formatCompactCount(value)}
        </span>
      ))}
    </div>
  )
}

export type CharacterThumbnailCardProps = {
  imageUrl: string | null
  name: string
  messageCount?: number
  likeCount?: number
  commentCount?: number
  showStats?: boolean
  /** 기본 square — 리스트 카드는 aspect-[3/4] */
  aspectClassName?: string
  className?: string
  statsSize?: 'sm' | 'md'
  /** group-hover 시 전경 이미지 확대 */
  interactive?: boolean
  children?: ReactNode
}

export function CharacterThumbnailCard({
  imageUrl,
  name,
  messageCount = 0,
  likeCount = 0,
  commentCount = 0,
  showStats = true,
  aspectClassName = 'aspect-square',
  className,
  statsSize = 'md',
  interactive = false,
  children,
}: CharacterThumbnailCardProps) {
  return (
    <div
      className={cn(
        'relative w-full shrink-0 overflow-hidden bg-muted',
        aspectClassName,
        className,
      )}
    >
      {imageUrl ? (
        <>
          {/* object-contain 여백: 같은 이미지를 블러 처리해 채움 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.65] saturate-150"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name}
            className={cn(
              'relative z-1 h-full w-full object-contain',
              interactive &&
                'transition-transform duration-300 group-hover:scale-105',
            )}
          />
          {showStats ? (
            <CharacterThumbnailStats
              messageCount={messageCount}
              likeCount={likeCount}
              commentCount={commentCount}
              size={statsSize}
            />
          ) : null}
        </>
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center text-muted-foreground/40',
            statsSize === 'sm' ? 'text-3xl' : 'text-5xl',
          )}
        >
          {name[0]}
        </div>
      )}
      {children}
    </div>
  )
}
