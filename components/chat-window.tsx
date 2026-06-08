'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, MoreVertical } from 'lucide-react'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MobileShell } from '@/components/ui/mobile-shell'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatComposer } from '@/components/chat/chat-composer'
import { LoginModal } from '@/components/auth/login-modal'
import { createClient } from '@/lib/supabase/browser'

function getTime() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({
  character,
  seed,
  conversationId: initialConversationId = null,
  initialMessages = [],
}: {
  character: Character
  seed: string
  conversationId?: string | null
  initialMessages?: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user)
      if (session?.user) setShowLoginModal(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function sendMessage() {
    const trimmed = draft.trim()
    if (!trimmed || isLoading) return

    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    const userMsg: Message = { role: 'user', content: trimmed, time: getTime() }
    const next = [...messages, userMsg]
    setMessages(next)
    setDraft('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          conversationId,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = data.reply ?? '...'
      if (data.conversationId) setConversationId(data.conversationId)

      setMessages((prev) => [...prev, { role: 'model', content: reply, time: getTime() }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: '잠깐 연결이 끊겼어. 다시 얘기해줄래?', time: getTime() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    <MobileShell>
      <div className="flex h-screen flex-col overflow-hidden">

        {/* 헤더 */}
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-1 py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            asChild
            aria-label="뒤로가기"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/characters/${character.id}`}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="line-clamp-1 flex-1 text-center text-sm font-medium text-foreground">
            {character.name}
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="메뉴 (준비 중)"
            disabled
            className="text-muted-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </header>

        {/* 채팅 본문 */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatThread messages={messages} isLoading={isLoading} character={character} />
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={sendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </MobileShell>
    </>
  )
}
