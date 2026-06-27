import type { ReactNode } from 'react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Characters | Waneck',
  description: 'Discover AI characters on Waneck',
}

export default function CharactersLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>
}
