'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const DISMISS_VIEWPORT_HEIGHT_PERCENT = 50

function viewportHeightToPx(viewportHeightPercent: number) {
  if (typeof window === 'undefined') return 400
  return Math.round((window.innerHeight * viewportHeightPercent) / 100)
}

type UseBottomSheetDragOptions = {
  open: boolean
  onDismiss: () => void
  defaultViewportHeightPercent?: number
  maxViewportHeightPercent?: number
}

export function useBottomSheetDrag({
  open,
  onDismiss,
  defaultViewportHeightPercent = 72,
  maxViewportHeightPercent = 92,
}: UseBottomSheetDragOptions) {
  const boundsRef = useRef({
    dismissPx: viewportHeightToPx(DISMISS_VIEWPORT_HEIGHT_PERCENT),
    defaultPx: viewportHeightToPx(defaultViewportHeightPercent),
    maxPx: viewportHeightToPx(maxViewportHeightPercent),
  })

  const dragOffsetYRef = useRef(0)
  const sheetHeightPxRef = useRef(boundsRef.current.defaultPx)
  const dragSessionRef = useRef({
    pointerId: -1,
    startClientY: 0,
    startHeightPx: 0,
    isDragging: false,
  })

  const [sheetHeightPx, setSheetHeightPx] = useState(
    () => boundsRef.current.defaultPx,
  )
  const [dragOffsetY, setDragOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  function syncBounds() {
    boundsRef.current = {
      dismissPx: viewportHeightToPx(DISMISS_VIEWPORT_HEIGHT_PERCENT),
      defaultPx: viewportHeightToPx(defaultViewportHeightPercent),
      maxPx: viewportHeightToPx(maxViewportHeightPercent),
    }
  }

  // 열릴 때마다 기본 높이로 리셋
  useEffect(() => {
    if (!open) return

    syncBounds()
    const defaultHeightPx = boundsRef.current.defaultPx
    dragOffsetYRef.current = 0
    dragSessionRef.current.isDragging = false
    sheetHeightPxRef.current = defaultHeightPx
    setSheetHeightPx(defaultHeightPx)
    setDragOffsetY(0)
    setIsDragging(false)
  }, [open, defaultViewportHeightPercent, maxViewportHeightPercent])

  useEffect(() => {
    function handleResize() {
      syncBounds()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [defaultViewportHeightPercent, maxViewportHeightPercent])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return

      dragSessionRef.current = {
        pointerId: event.pointerId,
        startClientY: event.clientY,
        startHeightPx: sheetHeightPx,
        isDragging: true,
      }
      dragOffsetYRef.current = 0
      setIsDragging(true)
      setDragOffsetY(0)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [sheetHeightPx],
  )

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current
    if (!session.isDragging || session.pointerId !== event.pointerId) return

    const { dismissPx, maxPx } = boundsRef.current
    const deltaY = session.startClientY - event.clientY
    const nextHeightPx = session.startHeightPx + deltaY

    if (nextHeightPx >= dismissPx) {
      dragOffsetYRef.current = 0
      const clampedHeightPx = Math.min(maxPx, nextHeightPx)
      sheetHeightPxRef.current = clampedHeightPx
      setSheetHeightPx(clampedHeightPx)
      setDragOffsetY(0)
      return
    }

    const overscrollPx = dismissPx - nextHeightPx
    dragOffsetYRef.current = overscrollPx
    sheetHeightPxRef.current = dismissPx
    setSheetHeightPx(dismissPx)
    setDragOffsetY(overscrollPx)
  }, [])

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const session = dragSessionRef.current
      if (!session.isDragging || session.pointerId !== event.pointerId) return

      session.isDragging = false
      session.pointerId = -1
      setIsDragging(false)

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      const { dismissPx } = boundsRef.current
      const shouldDismiss =
        sheetHeightPxRef.current <= dismissPx || dragOffsetYRef.current > 0

      if (shouldDismiss) {
        onDismiss()
        return
      }

      dragOffsetYRef.current = 0
      setDragOffsetY(0)
    },
    [onDismiss],
  )

  const contentStyle: CSSProperties = {
    height: sheetHeightPx,
    maxHeight: boundsRef.current.maxPx,
    transform:
      dragOffsetY > 0 ? `translate3d(0, ${dragOffsetY}px, 0)` : undefined,
  }

  return {
    isDragging,
    contentStyle,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  }
}
