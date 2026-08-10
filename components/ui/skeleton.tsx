import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden
    />
  )
}

/** 캐릭터 그리드 카드 로딩 스켈레톤 */
export function CharacterCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <Skeleton className="aspect-3/4 w-full rounded-xl" />
      <div className="mt-2 space-y-1.5">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
      </div>
    </div>
  )
}

/** 홈 히어로 배너 로딩 스켈레톤 — FeaturedCharacterHero(정사각형) 레이아웃 형태를 그대로 반영 */
export function HeroBannerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative aspect-square w-full overflow-hidden rounded-2xl bg-muted', className)}
      aria-hidden
    >
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
        <Skeleton className="h-5 w-2/3 bg-muted-foreground/20" />
        <Skeleton className="h-3 w-full bg-muted-foreground/20" />
        <Skeleton className="h-3 w-1/2 bg-muted-foreground/20" />
        <Skeleton className="mt-1.5 h-7 w-28 rounded-lg bg-muted-foreground/20" />
      </div>
    </div>
  )
}
