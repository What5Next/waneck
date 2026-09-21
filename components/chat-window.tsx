"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from "socket.io-client";
import { toast } from 'sonner'

import type { Character } from '@/lib/types'
import type { Message } from '@/lib/types'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatComposer } from '@/components/chat/chat-composer'
import type { SuggestedReply } from '@/components/chat/suggested-replies'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'
import { useResolvedConversationModel } from '@/hooks/use-user-settings'
import { useAiModelsQuery } from '@/hooks/queries/use-ai-models-query'
import { resolveModelName } from '@/lib/ai-models'
import { bumpCharacterMessageCountInCache } from '@/lib/api/character-stats-cache'
import { queryKeys } from '@/lib/api/query-keys'
import { createClient } from '@/lib/supabase/browser'
import type { ProfileSummary } from '@/lib/user-profile'

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

type ChatAcceptedEvent = {
  conversationId: string
  clientMessageId?: string
  messageId: string
  jobId: string
  tokenCost?: number
  tokenBalance?: number
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

function syncProfileTokenBalance(
  queryClient: ReturnType<typeof useQueryClient>,
  tokenBalance: unknown,
) {
  if (typeof tokenBalance !== 'number' || !Number.isFinite(tokenBalance)) {
    return
  }

  queryClient.setQueryData<ProfileSummary>(
    queryKeys.profile.me(),
    (current) =>
      current ? { ...current, token_balance: tokenBalance } : current,
  )
}

/** TODO: 실제 AI 생성 API 연동 전까지 쓰는 목업 — 실제 대화 맥락과 무관 */
const MOCK_SUGGESTED_REPLIES: SuggestedReply[] = [
  { narration: '잠시 생각에 잠긴 표정을 짓는다.', dialogue: '음... 그건 나도 잘 모르겠어.' },
  { narration: '살짝 미소를 지으며 고개를 끄덕인다.', dialogue: '응, 좋아! 그렇게 하자.' },
  { narration: '눈을 크게 뜨며 놀란 기색을 보인다.', dialogue: '정말? 그게 진짜야?' },
]

function suggestedReplyToText(item: SuggestedReply): string {
  return item.narration ? `*${item.narration}* ${item.dialogue}` : item.dialogue
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
  const [suggestedReplies, setSuggestedReplies] = useState<SuggestedReply[]>([])
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [conversationId] = useState<string | null>(initialConversationId)
  const { modelId, setModelId: setModel } =
    useResolvedConversationModel(conversationId)
  const { data: aiModels = [] } = useAiModelsQuery()
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

        syncProfileTokenBalance(queryClient, event.tokenBalance)
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

  async function sendMessage(overrideText?: string) {
    const trimmed = (overrideText ?? draft).trim()
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
    setSuggestedReplies([])
    if (overrideText === undefined) setDraft('')
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

  function requestSuggestions() {
    if (isFetchingSuggestions || isLoading) return

    setIsFetchingSuggestions(true)
    setSuggestedReplies([])

    // TODO: 실제 AI 생성 API·크레딧 차감 연동 전까지 쓰는 목업
    window.setTimeout(() => {
      setSuggestedReplies(MOCK_SUGGESTED_REPLIES)
      setIsFetchingSuggestions(false)
    }, 600)
  }

  function selectSuggestedReply(item: SuggestedReply) {
    setSuggestedReplies([])
    void sendMessage(suggestedReplyToText(item))
  }

  function autoPlay() {
    if (isAutoPlaying || isLoading) return

    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    setIsAutoPlaying(true)
    setSuggestedReplies([])

    // TODO: 실제로는 크레딧 차감 + 서버가 대화 맥락 기반으로 스토리를 이어가는 API 연동 필요 — 지금은 목업
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: '*잠시 정적이 흐른 뒤, 이야기가 스스로 이어진다.*',
          time: getTime(),
        },
      ])
      setIsAutoPlaying(false)
    }, 800)
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
          <ChatThread
            messages={messages}
            isLoading={isLoading}
            character={character}
            suggestedReplies={suggestedReplies}
            onSelectSuggestedReply={selectSuggestedReply}
          />
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => sendMessage()}
            disabled={isLoading}
            model={modelId}
            onModelChange={setModel}
            suggestions={parseCharacterSuggestions(character.suggestions)}
            onRequestSuggestions={requestSuggestions}
            isFetchingSuggestions={isFetchingSuggestions}
            onAutoPlay={autoPlay}
            isAutoPlaying={isAutoPlaying}
          />
        </div>
      </div>
    </>
  )
}
