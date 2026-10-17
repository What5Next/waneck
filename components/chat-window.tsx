"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from "socket.io-client";
import { toast } from 'sonner'

import type { Character, CharacterSituationImage } from '@/lib/types'
import type { Message } from '@/lib/types'
import { ChatThread } from '@/components/chat/chat-thread'
import { ChatComposer } from '@/components/chat/chat-composer'
import type { SuggestedReply } from '@/components/chat/suggested-replies'
import { LoginModal } from '@/components/auth/login-modal'
import type { ChatSystemNotice } from '@/components/chat/chat-thread'
import { SAFETY_NOTICES, SAFETY_OUTPUT_NOTICES, checkMessageSafety } from '@/lib/chat-safety'
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
  showOpeningSuggestions = false,
  situationImages = [],
}: {
  character: Character
  conversationId?: string | null
  initialMessages?: Message[]
  showOpeningSuggestions?: boolean
  situationImages?: CharacterSituationImage[]
}) {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages.map((message) => {
    if (message.role !== 'model') return message
    const safety = checkMessageSafety(message.content)
    return safety.ok ? message : { ...message, content: SAFETY_OUTPUT_NOTICES[safety.category] }
  }))
  const [isLoading, setIsLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [suggestedReplies, setSuggestedReplies] = useState<SuggestedReply[]>(() =>
    showOpeningSuggestions && Array.isArray(character.suggestions)
      ? character.suggestions.filter((reply): reply is string => typeof reply === 'string' && reply.trim().length > 0)
          .map((reply) => ({ dialogue: reply.trim() }))
      : [],
  )
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [conversationId] = useState<string | null>(initialConversationId)
  const { modelId, setModelId: setModel } =
    useResolvedConversationModel(conversationId)
  const { data: aiModels = [] } = useAiModelsQuery()
  // P1: 채팅 전송 전 로그인 여부 확인용
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  // 위험한 입력(자해·19금)이 감지되면 전송을 막고 채팅 안에 시스템 메시지로 알린다
  const [notices, setNotices] = useState<ChatSystemNotice[]>([])
  const queryClient = useQueryClient()
  const socketRef = useRef<ChatSocket | null>(null)
  const isStreamingRef = useRef(false)
  const responseBufferRef = useRef('')
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
        // 완성 전에는 표시하지 않는다. 단어가 여러 delta로 나뉘어도 안전 검사 후 노출한다.
        responseBufferRef.current += event.delta
      })

      socket.on('chat:complete', (event) => {
        if (event.conversationId !== conversationId) return

        const completedSend = pendingSendRef.current
        isStreamingRef.current = false
        pendingSendRef.current = null
        setIsLoading(false)
        const reply = event.content || responseBufferRef.current
        responseBufferRef.current = ''
        const safety = checkMessageSafety(reply)
        if (!safety.ok) {
          const notice = SAFETY_OUTPUT_NOTICES[safety.category]
          setNotices((prev) => [...prev, {
            id: createClientMessageId(),
            afterIndex: completedSend?.previousMessages.length ?? -1,
            text: notice,
          }])
          toast.warning(notice)
          return
        }
        setMessages((prev) => {
          const last = prev[prev.length - 1]

          if (last?.role === 'model') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: reply, time: getTime() },
            ]
          }

          return [
            ...prev,
            { role: 'model', content: reply, time: getTime() },
          ]
        })
        bumpCharacterMessageCountInCache(queryClient, character.id, 2)
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
      })

      socket.on('chat:error', (event) => {
        if (event.conversationId && event.conversationId !== conversationId) {
          return
        }

        const pendingSend = pendingSendRef.current
        isStreamingRef.current = false
        responseBufferRef.current = ''
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
      responseBufferRef.current = ''
    }
  }, [character.id, conversationId, isAuthenticated, queryClient])

  async function sendMessage(overrideText?: string) {
    const trimmed = (overrideText ?? draft).trim()
    if (!trimmed || isLoading) return

    // 전송 전 안전 검사 — 막힌 글은 입력창에 그대로 남겨 고쳐 쓸 수 있게 한다
    const safety = checkMessageSafety(trimmed)
    if (!safety.ok) {
      setNotices((prev) => [
        ...prev,
        {
          id: createClientMessageId(),
          afterIndex: messages.length - 1,
          text: SAFETY_NOTICES[safety.category],
        },
      ])
      toast.warning(SAFETY_NOTICES[safety.category])
      return
    }

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
    responseBufferRef.current = ''
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
            notices={notices}
            isLoading={isLoading}
            character={character}
            situationImages={situationImages}
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
