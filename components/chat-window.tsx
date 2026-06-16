'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatComposer } from '@/components/chat/chat-composer'
import { MODELS, type ModelId } from '@/components/chat/model-selector'
import { LoginModal } from '@/components/auth/login-modal'
import { createClient } from '@/lib/supabase/browser'

function getTime() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({
  character,
  conversationId: initialConversationId = null,
  initialMessages = [],
}: {
  character: Character
  conversationId?: string | null
  initialMessages?: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState<ModelId>(MODELS[0].id)
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
          model,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = data.reply ?? '...'
      if (data.conversationId) setConversationId(data.conversationId)

      setMessages((prev) => [...prev, { role: 'model', content: reply, time: getTime() }])
    } catch {
      setMessages(next.slice(0, -1))
      setDraft(trimmed)
      toast.error('전송에 실패했어요. 다시 전송해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />

      <div className="flex h-full flex-col overflow-hidden">
        {/* 채팅 본문 */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatThread messages={messages} isLoading={isLoading} character={character} />
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={sendMessage}
            disabled={isLoading}
            model={model}
            onModelChange={setModel}
          />
        </div>
      </div>
    </>
  )
}
