'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import { CharacterListCard } from '@/components/characters/character-list-card'
import { MobileShell } from '@/components/mobile-shell'
import { EmptyState } from '@/components/ui/empty-state'
import { PageLoading } from '@/components/ui/page-loading'
import { PageNavBar } from '@/components/ui/page-nav-bar'
import { useLikedCharactersQuery } from '@/hooks/queries/use-liked-characters-query'

export default function LikedCharactersPage() {
  const router = useRouter()
  const { data: characters = [], isPending } = useLikedCharactersQuery()

  return (
    <MobileShell>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <header className="sticky top-0 z-20 hidden shrink-0 border-b border-border bg-background/95 backdrop-blur-sm sm:block">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md p-2 hover:bg-muted/50"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h1 className="px-1 text-base font-semibold">Liked characters</h1>
          </div>
        </header>

        <div className="scroll-hide min-h-0 flex-1 overflow-y-auto pb-8">
          <PageNavBar
            title="Liked characters"
            onBack={() => router.back()}
            titleClassName="font-semibold text-foreground"
            className="sm:hidden"
          />

          <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
            {isPending ? (
              <PageLoading />
            ) : characters.length === 0 ? (
              <EmptyState
                message="아직 좋아요한 캐릭터가 없습니다."
                className="min-h-[200px]"
              />
            ) : (
              characters.map((character) => (
                <CharacterListCard key={character.id} character={character} />
              ))
            )}

            {!isPending && characters.length > 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/characters" className="underline underline-offset-2">
                  Explore more characters
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </MobileShell>
  )
}
