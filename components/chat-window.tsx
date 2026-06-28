'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatComposer } from '@/components/chat/chat-composer'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'
import { useResolvedDefaultModel } from '@/hooks/use-user-settings'
import { useAiModelsQuery } from '@/hooks/queries/use-ai-models-query'
import { resolveModelName } from '@/lib/ai-models'
import { bumpCharacterMessageCountInCache } from '@/lib/api/character-stats-cache'

function parseCharacterSuggestions(raw: Character['suggestions']): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

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
  // P5: mypage 모델 설정과 storage 연동
  const { modelId, setModelId: setModel } = useResolvedDefaultModel()
  const { data: aiModels = [] } = useAiModelsQuery()
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  // P1: 채팅 전송 전 로그인 여부 확인용
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const queryClient = useQueryClient()

  // 로그인 성공 후 로그인 모달 자동 닫기
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginModal(false)
    }
  }, [isAuthenticated])

  async function sendMessage() {
    const trimmed = draft.trim()
    if (!trimmed || isLoading) return

    if (!isAuthenticated) {
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
          model: resolveModelName(modelId, aiModels),
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = data.reply ?? '...'
      if (data.conversationId) setConversationId(data.conversationId)

      setMessages((prev) => [...prev, { role: 'model', content: reply, time: getTime() }])
      bumpCharacterMessageCountInCache(queryClient, character.id, 2)
    } catch {
      setMessages(next.slice(0, -1))
      setDraft(trimmed)
      toast.error('Failed to send. Please try again.')
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
            model={modelId}
            onModelChange={setModel}
            suggestions={parseCharacterSuggestions(character.suggestions)}
          />
        </div>
      </div>
    </>
  )
}
