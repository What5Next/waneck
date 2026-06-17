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

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'
const collapseListeners = new Set<() => void>()

function subscribeCollapsed(onStoreChange: () => void) {
  collapseListeners.add(onStoreChange)
  return () => {
    collapseListeners.delete(onStoreChange)
  }
}

function emitCollapsedChange() {
  collapseListeners.forEach((listener) => listener())
}

function getCollapsedSnapshot() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
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

  // SSR·하이드레이션 시 서버 스냅샷(false)과 맞춤
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  )

  const toggleSidebar = useCallback(() => {
    const nextCollapsed = !getCollapsedSnapshot()
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextCollapsed))
    emitCollapsedChange()
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
