import { cn } from '@/lib/utils'

export function MobileShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('h-full min-h-0 w-full max-w-[960px] min-w-[300px]', className)}>
      {children}
    </div>
  )
}
