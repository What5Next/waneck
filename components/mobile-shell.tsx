export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-full min-h-0 w-full max-w-[720px] min-w-[300px]'>
      {children}
    </div>
  )
}