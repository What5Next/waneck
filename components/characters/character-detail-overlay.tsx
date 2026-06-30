'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { CharacterDetailModal } from '@/components/character-detail-modal'
import { PageLoading } from '@/components/ui/page-loading'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useCharacterQuery } from '@/hooks/queries/use-character-query'
import { useIsDesktop } from '@/hooks/use-media-query'

type CharacterDetailOverlayContextValue = {
  /** PC에서 라우팅 없이 상세 모달 열기 */
  openCharacter: (characterId: string) => void
  /** 오버레이 모달 닫기 */
  closeCharacter: () => void
  /** 현재 오버레이로 열린 캐릭터 ID */
  characterId: string | null
}

const CharacterDetailOverlayContext =
  createContext<CharacterDetailOverlayContextValue | null>(null)

export function CharacterDetailOverlayProvider({ children }: { children: ReactNode }) {
  const [characterId, setCharacterId] = useState<string | null>(null)

  const openCharacter = useCallback((nextCharacterId: string) => {
    setCharacterId(nextCharacterId)
  }, [])

  const closeCharacter = useCallback(() => {
    setCharacterId(null)
  }, [])

  const value = useMemo(
    () => ({
      openCharacter,
      closeCharacter,
      characterId,
    }),
    [characterId, closeCharacter, openCharacter],
  )

  return (
    <CharacterDetailOverlayContext.Provider value={value}>
      {children}
      <CharacterDetailOverlayHost />
    </CharacterDetailOverlayContext.Provider>
  )
}

export function useCharacterDetailOverlay() {
  const context = useContext(CharacterDetailOverlayContext)
  if (!context) {
    throw new Error(
      'useCharacterDetailOverlay must be used within CharacterDetailOverlayProvider',
    )
  }
  return context
}

/** Provider 밖(선택) — 모달 내부 등에서 오버레이 전환용 */
export function useCharacterDetailOverlayOptional() {
  return useContext(CharacterDetailOverlayContext)
}

function CharacterDetailOverlayHost() {
  const isDesktop = useIsDesktop()
  const { characterId, closeCharacter } = useCharacterDetailOverlay()
  const { data: character, isPending, error } = useCharacterQuery(characterId ?? '', {
    enabled: isDesktop && !!characterId,
  })

  useEffect(() => {
    if (error && characterId) {
      closeCharacter()
    }
  }, [characterId, closeCharacter, error])

  if (!isDesktop || !characterId) {
    return null
  }

  if (isPending && !character) {
    return (
      <Dialog open onOpenChange={(open) => !open && closeCharacter()}>
        <DialogContent showClose className="max-w-sm">
          <DialogTitle className="sr-only">Loading character</DialogTitle>
          <DialogDescription className="sr-only">
            Loading character details
          </DialogDescription>
          <PageLoading />
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !character) {
    return null
  }

  return (
    <CharacterDetailModal
      key={character.id}
      character={character}
      closeMode="overlay"
      onClose={closeCharacter}
    />
  )
}
