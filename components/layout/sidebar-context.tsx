'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import {
  getStorageItem,
  setStorageItem,
  subscribeStorageKey,
} from '@/lib/stores/local-storage-store'
import { SIDEBAR_COLLAPSED_KEY } from '@/lib/user-settings'

function getCollapsedSnapshot() {
  return getStorageItem(SIDEBAR_COLLAPSED_KEY) === 'true'
}

function getCollapsedServerSnapshot() {
  return false
}

type SidebarContextValue = {
  collapsed: boolean
  mobileOpen: boolean
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // 하이드레이션 완료 전까지는 서버와 동일한 UI 유지
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const storedCollapsed = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SIDEBAR_COLLAPSED_KEY, onStoreChange),
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  )

  const collapsed = isClient ? storedCollapsed : false

  const toggleSidebar = useCallback(() => {
    const nextCollapsed = !getCollapsedSnapshot()
    setStorageItem(SIDEBAR_COLLAPSED_KEY, String(nextCollapsed))
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      toggleSidebar,
      toggleMobileSidebar,
      closeMobileSidebar,
    }),
    [collapsed, mobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
