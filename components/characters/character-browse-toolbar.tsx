'use client'

import {
  Clock,
  FlaskConical,
  LayoutGrid,
  List,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

import type { BrowseSortTab } from '@/lib/character-browse'
import { BROWSE_SORT_TABS } from '@/lib/character-browse'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export type BrowseViewMode = 'grid' | 'list'

const SORT_TAB_ICONS = {
  relevance: Sparkles,
  chat_count: MessageSquare,
  newest: Clock,
} as const

interface CharacterBrowseToolbarProps {
  aiSearchEnabled: boolean
  onAiSearchChange: (enabled: boolean) => void
  sortTab: BrowseSortTab
  onSortTabChange: (tab: BrowseSortTab) => void
  viewMode: BrowseViewMode
  onViewModeChange: (mode: BrowseViewMode) => void
}

export function CharacterBrowseToolbar({
  aiSearchEnabled,
  onAiSearchChange,
  sortTab,
  onSortTabChange,
  viewMode,
  onViewModeChange,
}: CharacterBrowseToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
      <label className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-foreground/80">
        <span className="flex items-center gap-1.5">
          <FlaskConical className="size-3.5" aria-hidden />
          <span>AI Search</span>
        </span>
        <Switch
          checked={aiSearchEnabled}
          onCheckedChange={onAiSearchChange}
          aria-label="AI Search"
        />
      </label>

      <div
        role="tablist"
        aria-label="정렬"
        className="grid h-8 w-fit shrink-0 grid-cols-3 gap-1 rounded-full bg-muted/30 p-1"
      >
        {BROWSE_SORT_TABS.map((tab) => {
          const Icon = SORT_TAB_ICONS[tab.id]
          const isActive = sortTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSortTabChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[12px] font-medium whitespace-nowrap transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-3" aria-hidden />
              <span className="leading-none">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex h-8 items-center gap-1 rounded-full bg-muted/30 p-1">
        <button
          type="button"
          aria-label="그리드 보기"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'flex size-6 items-center justify-center rounded-full transition-colors',
            viewMode === 'grid'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <LayoutGrid className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="리스트 보기"
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
          className={cn(
            'flex size-6 items-center justify-center rounded-full transition-colors',
            viewMode === 'list'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <List className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
