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

/** 캐릭터 리스트 카드 로딩 스켈레톤 */
export function CharacterListCardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-36 min-w-0 rounded-lg', className)} />
}

/** 홈 히어로 배너 로딩 스켈레톤 */
export function HeroBannerSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-[220px] w-full rounded-2xl', className)} />
}
