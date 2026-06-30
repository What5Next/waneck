"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from "socket.io-client";
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
import { createClient } from '@/lib/supabase/browser'

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

type ChatAcceptedEvent = {
  conversationId: string
  clientMessageId?: string
  messageId: string
  jobId: string
}

type ChatDeltaEvent = {
  conversationId: string
  delta: string
}

type ChatCompleteEvent = {
  conversationId: string
  messageId: string
  content: string
}

type ChatErrorEvent = {
  conversationId?: string
  code: string
  message: string
}

type ChatServerEvents = {
  'chat:accepted': (event: ChatAcceptedEvent) => void
  'chat:delta': (event: ChatDeltaEvent) => void
  'chat:complete': (event: ChatCompleteEvent) => void
  'chat:error': (event: ChatErrorEvent) => void
}

type ChatClientEvents = {
  'chat:send': (payload: {
    conversationId: string
    content: string
    clientMessageId?: string
    modelName?: string
  }) => void
}

type ChatSocket = Socket<ChatServerEvents, ChatClientEvents>

function parseCharacterSuggestions(raw: Character['suggestions']): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function getTime() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function createClientMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function isRollbackError(code: string) {
  return [
    'unauthorized',
    'validation_error',
    'invalid_model',
    'conversation_busy',
    'send_failed',
  ].includes(code)
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
  const [conversationId] = useState<string | null>(initialConversationId)
  // P1: 채팅 전송 전 로그인 여부 확인용
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const queryClient = useQueryClient()
  const socketRef = useRef<ChatSocket | null>(null)
  const isStreamingRef = useRef(false)
  const pendingSendRef = useRef<{
    content: string
    previousMessages: Message[]
  } | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !conversationId) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    let disposed = false
    const supabase = createClient()

    async function connectSocket() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (disposed) return

      const token = session?.access_token
      if (!token) {
        socketRef.current?.disconnect()
        socketRef.current = null
        return
      }

      const socket: ChatSocket = io(`${CHAT_API_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
      })

      socketRef.current?.disconnect()
      socketRef.current = socket

      socket.on('chat:accepted', (event) => {
        if (event.conversationId !== conversationId) return
      })

      socket.on('chat:delta', (event) => {
        if (event.conversationId !== conversationId) return
        if (!event.delta) return

        isStreamingRef.current = true
        setMessages((prev) => {
          const last = prev[prev.length - 1]

          if (last?.role === 'model') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + event.delta },
            ]
          }

          return [
            ...prev,
            { role: 'model', content: event.delta, time: getTime() },
          ]
        })
      })

      socket.on('chat:complete', (event) => {
        if (event.conversationId !== conversationId) return

        isStreamingRef.current = false
        pendingSendRef.current = null
        setIsLoading(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]

          if (last?.role === 'model') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: event.content, time: getTime() },
            ]
          }

          return [
            ...prev,
            { role: 'model', content: event.content, time: getTime() },
          ]
        })
        bumpCharacterMessageCountInCache(queryClient, character.id, 2)
      })

      socket.on('chat:error', (event) => {
        if (event.conversationId && event.conversationId !== conversationId) {
          return
        }

        const pendingSend = pendingSendRef.current
        isStreamingRef.current = false
        pendingSendRef.current = null
        setIsLoading(false)

        if (pendingSend && isRollbackError(event.code)) {
          setMessages(pendingSend.previousMessages)
          setDraft(pendingSend.content)
        }

        if (event.code === 'unauthorized') {
          setShowLoginModal(true)
        }

        toast.error(event.message || 'Failed to send. Please try again.')
      })

      socket.on('connect_error', () => {
        setIsLoading(false)
        toast.error('Unable to connect to chat server.')
      })
    }

    void connectSocket()

    return () => {
      disposed = true
      socketRef.current?.disconnect()
      socketRef.current = null
      isStreamingRef.current = false
    }
  }, [character.id, conversationId, isAuthenticated, queryClient])

  async function sendMessage() {
    const trimmed = draft.trim()
    if (!trimmed || isLoading) return

    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (!conversationId) {
      toast.error('Chat room is not ready yet.')
      return
    }

    const socket = socketRef.current
    if (!socket) {
      toast.error('Chat server is not connected yet.')
      return
    }

    const userMsg: Message = { role: 'user', content: trimmed, time: getTime() }
    const next = [...messages, userMsg]
    setMessages(next)
    setDraft('')
    setIsLoading(true)
    pendingSendRef.current = {
      content: trimmed,
      previousMessages: messages,
    }

    socket.emit('chat:send', {
      conversationId,
      content: trimmed,
      clientMessageId: createClientMessageId(),
      modelName: resolveModelName(modelId, aiModels) ?? undefined,
    })
  }

  return (
    <>
      <LoginModal
        open={showLoginModal && !isAuthenticated}
        onOpenChange={setShowLoginModal}
      />

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
