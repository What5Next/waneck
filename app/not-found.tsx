import Link from 'next/link'

export const metadata = {
  title: 'Page not found | whatsnext',
}

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="text-5xl font-semibold tracking-tight">404</p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
