import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  moreHref?: string
  moreLabel?: string
  className?: string
}

/** 섹션 제목 + 선택적 "전체보기" 링크 */
export function SectionHeader({
  title,
  moreHref,
  moreLabel = '전체보기',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-3 flex items-center justify-between px-4',
        !moreHref && 'justify-start',
        className,
      )}
    >
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      {moreHref ? (
        <Link
          href={moreHref}
          className="flex items-center gap-0.5 text-[12px] text-muted-foreground hover:text-foreground"
        >
          {moreLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  )
}
