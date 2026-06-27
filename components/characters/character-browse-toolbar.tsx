'use client'

import { Clock, LayoutGrid, List, MessageSquare, Sparkles } from 'lucide-react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import type { BrowseSortTab } from '@/lib/character-browse'
import { BROWSE_SORT_TABS } from '@/lib/character-browse'

export type BrowseViewMode = 'grid' | 'list'

const SORT_TAB_OPTIONS = BROWSE_SORT_TABS.map((tab) => ({
  value: tab.id,
  label: tab.label,
  icon:
    tab.id === 'relevance'
      ? Sparkles
      : tab.id === 'chat_count'
        ? MessageSquare
        : Clock,
}))

const VIEW_OPTIONS = [
  { value: 'grid' as const, label: '그리드', icon: LayoutGrid, 'aria-label': '그리드 보기' },
  { value: 'list' as const, label: '리스트', icon: List, 'aria-label': '리스트 보기' },
]

interface CharacterBrowseToolbarProps {
  sortTab: BrowseSortTab
  onSortTabChange: (tab: BrowseSortTab) => void
  viewMode: BrowseViewMode
  onViewModeChange: (mode: BrowseViewMode) => void
}

export function CharacterBrowseToolbar({
  sortTab,
  onSortTabChange,
  viewMode,
  onViewModeChange,
}: CharacterBrowseToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
      <SegmentedControl
        value={sortTab}
        onValueChange={onSortTabChange}
        options={SORT_TAB_OPTIONS}
        columns={3}
        aria-label="정렬"
      />

      <SegmentedControl
        value={viewMode}
        onValueChange={onViewModeChange}
        options={VIEW_OPTIONS}
        iconOnly
        aria-label="보기 방식"
      />
    </div>
  )
}
