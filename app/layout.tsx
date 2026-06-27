import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'

import { Toaster } from 'sonner'

import { AppProviders } from '@/app/providers/app-providers'
import { ConditionalShell } from '@/components/layout/conditional-shell'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Waneck',
  description: 'Character chat with AI',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-visual',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className='overflow-hidden'>
        {/* P0: Theme + Query + Auth Provider (app/providers/app-providers.tsx) */}
        <AppProviders>
          <Toaster position="top-center" />
          <ConditionalShell>{children}</ConditionalShell>
        </AppProviders>
      </body>
    </html>
  )
}
