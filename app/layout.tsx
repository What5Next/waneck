import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'

import { ThemeProvider } from '@/app/providers/theme-provider'
import { Header } from '@/components/layout/header'
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
  title: 'Chat AI',
  description: 'AI 캐릭터와 대화하세요',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Header />
          <main className='flex justify-center'>
            <div className='w-full max-w-[720px] min-w-[300px]'>
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
