'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  BookOpen,
  ChevronRight,
  Cpu,
  Download,
  FlaskConical,
  History,
  Moon,
  NotebookText,
  Palette,
  Pencil,
  SlidersHorizontal,
  Sun,
  UserRound,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

type SettingsTab = 'memory' | 'persona' | 'notes' | 'output' | 'settings'

const SETTINGS_TABS: {
  id: SettingsTab
  label: string
  icon: ReactNode
}[] = [
  { id: 'memory', label: '메모리', icon: <BookOpen className="h-3 w-3" /> },
  { id: 'persona', label: '페르소나', icon: <UserRound className="h-3 w-3" /> },
  { id: 'notes', label: '노트', icon: <NotebookText className="h-3 w-3" /> },
  { id: 'output', label: '출력', icon: <Cpu className="h-3 w-3" /> },
  {
    id: 'settings',
    label: '설정',
    icon: <SlidersHorizontal className="h-3 w-3" />,
  },
]

const CHAT_ROOM_NAME_KEY_PREFIX = 'waneck-chat-room-name:'

type ChatSettingsPanelProps = {
  characterId: string
  characterName: string
  conversationId?: string | null
  onClose: () => void
  className?: string
}

function SettingsMenuRow({
  icon,
  label,
  showChevron = true,
  onClick,
}: {
  icon: ReactNode
  label: string
  showChevron?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        <span className="truncate text-[13px] font-medium text-foreground/90">{label}</span>
      </div>
      {showChevron ? (
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
      ) : null}
    </button>
  )
}

export function ChatSettingsPanel({
  characterId,
  characterName,
  conversationId,
  onClose,
  className,
}: ChatSettingsPanelProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings')
  const [roomName, setRoomName] = useState(characterName)
  const [isEditingName, setIsEditingName] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)

  const storageKey = conversationId
    ? `${CHAT_ROOM_NAME_KEY_PREFIX}${conversationId}`
    : `${CHAT_ROOM_NAME_KEY_PREFIX}${characterId}`

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    const storedName = localStorage.getItem(storageKey)
    setRoomName(storedName?.trim() || characterName)
  }, [storageKey, characterName])

  function handleSaveRoomName(nextName: string) {
    const trimmedName = nextName.trim()
    if (!trimmedName) {
      toast.error('채팅방 이름을 입력해주세요.')
      return
    }

    setRoomName(trimmedName)
    localStorage.setItem(storageKey, trimmedName)
    setIsEditingName(false)
  }

  function handleThemeToggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  function handleExport() {
    toast.message('대화보내기는 준비 중이에요.')
    onClose()
  }

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-50 mt-1.5 inline-flex w-max max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
        className,
      )}
    >
      <div className="p-3">
        {/* 상단 탭 — 이 행 너비가 패널 가로 길이를 결정 */}
        <div className="mb-3 flex w-max max-w-full flex-nowrap gap-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="scroll-hide max-h-[min(70vh,420px)] overflow-y-auto">
          {activeTab === 'settings' ? (
            <div className="space-y-3">
              {/* 채팅방 이름 */}
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">채팅방 이름</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 min-w-0 flex-1 items-center rounded-xl bg-muted/25 px-3">
                  {isEditingName ? (
                    <input
                      autoFocus
                      value={roomName}
                      onChange={(event) => setRoomName(event.target.value)}
                      onBlur={() => handleSaveRoomName(roomName)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSaveRoomName(roomName)
                        if (event.key === 'Escape') {
                          setIsEditingName(false)
                          setRoomName(
                            localStorage.getItem(storageKey)?.trim() || characterName,
                          )
                        }
                      }}
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                      aria-label="채팅방 이름 수정"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {roomName}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    aria-label="채팅방 이름 편집"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleThemeToggle}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/25 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  aria-label="테마 전환"
                >
                  {themeMounted ? (
                    isDark ? (
                      <Moon className="h-3.5 w-3.5" />
                    ) : (
                      <Sun className="h-3.5 w-3.5" />
                    )
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* 설정 메뉴 */}
            <div className="rounded-xl bg-muted/15 p-1.5">
              <SettingsMenuRow
                icon={<History className="h-3.5 w-3.5" />}
                label="채팅방 목록"
                onClick={() => toast.message('채팅방 목록은 준비 중이에요.')}
              />
              <SettingsMenuRow
                icon={<Palette className="h-3.5 w-3.5" />}
                label="채팅방 설정"
                onClick={() => toast.message('채팅방 설정은 준비 중이에요.')}
              />
              <SettingsMenuRow
                icon={<FlaskConical className="h-3.5 w-3.5" />}
                label="고급"
                onClick={() => toast.message('고급 설정은 준비 중이에요.')}
              />
              <SettingsMenuRow
                icon={<Download className="h-3.5 w-3.5" />}
                label="대화보내기"
                showChevron={false}
                onClick={handleExport}
              />
            </div>
          </div>
          ) : (
            <div className="rounded-xl bg-muted/15 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">준비 중인 기능이에요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
