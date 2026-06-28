import { CharacterDetailLink } from '@/components/characters/character-detail-link'
import { Skeleton } from '@/components/ui/skeleton'

type CharacterRecommendRowProps = {
  characterId: string
  name: string
  profileImageUrl: string | null
}

/** 모달 사이드바 추천 캐릭터 row */
export function CharacterRecommendRow({
  characterId,
  name,
  profileImageUrl,
}: CharacterRecommendRowProps) {
  return (
    <CharacterDetailLink
      characterId={characterId}
      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profileImageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {name[0]}
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-foreground">{name}</p>
    </CharacterDetailLink>
  )
}

/** 추천 row 로딩 skeleton */
export function CharacterRecommendRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
