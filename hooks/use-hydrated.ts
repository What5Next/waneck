'use client'

import { useEffect, useState, startTransition } from 'react'

/** SSR·하이드레이션 첫 페인트까지 false, 마운트 후 true */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setHydrated(true)
    })
  }, [])

  return hydrated
}
