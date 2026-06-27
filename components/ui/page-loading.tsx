import { cn } from '@/lib/utils'

interface PageLoadingProps {
  message?: string
  className?: string
}

/** 전체 페이지 로딩 플레이스홀더 */
export function PageLoading({
  message = 'Loading…',
  className,
}: PageLoadingProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-background', className)}>
      <div className="h-14 shrink-0 border-b border-border" />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
