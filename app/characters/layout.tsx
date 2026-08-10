import type { ReactNode } from 'react'
import { Suspense } from 'react'

export const metadata = {
  title: 'Characters | whatsnext',
  description: 'Discover AI characters on whatsnext',
}

export default function CharactersLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>
}
