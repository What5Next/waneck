'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'
import { useToggleCharacterLike } from '@/hooks/mutations/use-toggle-character-like'
import { cn } from '@/lib/utils'

type CharacterLikeButtonProps = {
  characterId: string
  createdBy: string | null
  isLiked: boolean
  className?: string
}

export function CharacterLikeButton({
  characterId,
  createdBy,
  isLiked,
  className,
}: CharacterLikeButtonProps) {
  const { isAuthenticated, user } = useAuth()
  const toggleLike = useToggleCharacterLike()
  const [showLogin, setShowLogin] = useState(false)

  const isSelfCharacter = Boolean(createdBy && user?.id === createdBy)
  const isPending = toggleLike.isPending

  async function handleClick() {
    if (isSelfCharacter || isPending) return

    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    try {
      await toggleLike.mutateAsync({ characterId, isLiked })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={`/characters/${characterId}`}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={isSelfCharacter || isPending}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40',
          className,
        )}
        aria-label={isLiked ? 'Unlike' : 'Like'}
        title={isSelfCharacter ? 'Cannot like your own character' : undefined}
      >
        <Heart
          className={cn('h-4 w-4', isLiked && 'fill-primary text-primary')}
        />
      </button>
    </>
  )
}
