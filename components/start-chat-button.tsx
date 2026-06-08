'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/auth/login-modal'
import { createClient } from '@/lib/supabase/browser'

export function StartChatButton({ characterId }: { characterId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
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
  }

  return (
    <>
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <Button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg h-11 py-2 px-4 text-base font-semibold"
      >
        {loading ? '대화 여는중' : '대화하기'}
      </Button>
    </>
  )
}
