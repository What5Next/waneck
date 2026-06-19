'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'

export function StartChatButton({ characterId }: { characterId: string }) {
  const router = useRouter()
  // P1: 매번 getUser() 호출 대신 중앙 세션 사용
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const startChat = useCallback(async () => {
    setLoading(true)
    try {
      if (!isAuthenticated) {
        setShowLogin(true)
        return
      }

      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      })

      if (!res.ok) throw new Error('conversation 생성 실패')

      const { conversationId } = await res.json()
      router.push(`/chat/${characterId}/${conversationId}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [characterId, router, isAuthenticated])

  useEffect(() => {
    // OAuth 리다이렉트 후 ?autostart=true 로 돌아오면 자동 대화 시작
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
        disabled={loading}
        className="w-full rounded-lg h-11 py-2 px-4 text-base font-semibold"
      >
        {loading ? '대화 여는중' : '대화하기'}
      </Button>
    </>
  )
}
