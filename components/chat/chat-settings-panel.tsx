'use client'

import { useState, type ReactNode } from 'react'
import {
  BookOpen,
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
import { useThemeReady } from '@/hooks/use-theme-ready'
import { toast } from 'sonner'

import {
  PopoverMenuGroup,
  PopoverMenuItem,
  PopoverMenuPanel,
} from '@/components/ui/popover-menu'
import { useChatRoomName } from '@/hooks/use-user-settings'
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
    <PopoverMenuItem
      icon={icon}
      label={label}
      showChevron={showChevron}
      onClick={onClick}
    />
  )
}

export function ChatSettingsPanel({
  characterId,
  characterName,
  conversationId,
  onClose,
  className,
}: ChatSettingsPanelProps) {
  const { isReady: isThemeReady, isDark, toggleTheme } = useThemeReady()
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings')
  const [isEditingName, setIsEditingName] = useState(false)
  // 편집 중에만 사용 — 진입/취소 시 roomName으로 초기화
  const [draftName, setDraftName] = useState('')

  const { value: roomName, setValue: setRoomName } = useChatRoomName(
    characterId,
    characterName,
    conversationId,
  )

  function handleStartEdit() {
    setDraftName(roomName)
    setIsEditingName(true)
  }

  function handleSaveRoomName(nextName: string) {
    const trimmedName = nextName.trim()
    if (!trimmedName) {
      toast.error('채팅방 이름을 입력해주세요.')
      return
    }

    setRoomName(trimmedName)
    setIsEditingName(false)
  }

  function handleCancelEdit() {
    setDraftName(roomName)
    setIsEditingName(false)
  }

  function handleThemeToggle() {
    toggleTheme()
  }

  function handleExport() {
    toast.message('대화보내기는 준비 중이에요.')
    onClose()
  }

  return (
    <PopoverMenuPanel side="bottom" align="end" className={className}>
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
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      onBlur={() => handleSaveRoomName(draftName)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSaveRoomName(draftName)
                        if (event.key === 'Escape') handleCancelEdit()
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
                    onClick={handleStartEdit}
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
                  {isThemeReady ? (
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
            <PopoverMenuGroup>
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
            </PopoverMenuGroup>
          </div>
          ) : (
            <div className="rounded-xl bg-muted/15 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">준비 중인 기능이에요.</p>
            </div>
          )}
        </div>
    </PopoverMenuPanel>
  )
}
