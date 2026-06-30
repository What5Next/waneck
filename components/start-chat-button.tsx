'use client'

import { useState, useEffect, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'
import { useStartChat } from '@/hooks/mutations/use-start-chat'

type StartChatButtonProps = {
  characterId: string
  /** 채팅 시작 직전 호출 (예: 상세 모달 닫기) */
  onBeforeNavigate?: () => void
}

export function StartChatButton({
  characterId,
  onBeforeNavigate,
}: StartChatButtonProps) {
  const { isAuthenticated } = useAuth()
  const startChatMutation = useStartChat()
  const [showLogin, setShowLogin] = useState(false)

  const startChat = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    onBeforeNavigate?.()

    try {
      await startChatMutation.mutateAsync(characterId)
    } catch (error) {
      console.error(error)
    }
  }, [characterId, isAuthenticated, onBeforeNavigate, startChatMutation])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('autostart') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      startChat()
    }
  }, [startChat])

  return (
    <>
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={`/characters/${characterId}?autostart=true`}
      />
      <Button
        onClick={startChat}
        disabled={startChatMutation.isPending}
        className="w-full rounded-lg h-11 py-2 px-4 text-base font-semibold"
      >
        {startChatMutation.isPending ? 'Opening chat…' : 'Start chat'}
      </Button>
    </>
  )
}
