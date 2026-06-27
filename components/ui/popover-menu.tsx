'use client'

import { Slot } from '@radix-ui/react-slot'
import Link from 'next/link'
import { ChevronRight, Check } from 'lucide-react'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type PopoverSide = 'top' | 'bottom'
type PopoverAlign = 'start' | 'end'

const positionClassSm: Record<`${PopoverSide}-${PopoverAlign}`, string> = {
  'top-start': 'bottom-full left-0 mb-1.5',
  'top-end': 'bottom-full right-0 mb-1.5',
  'bottom-start': 'top-full left-0 mt-1.5',
  'bottom-end': 'top-full right-0 mt-1.5',
}

const positionClassMd: Record<`${PopoverSide}-${PopoverAlign}`, string> = {
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
}

const widthClass = {
  auto: 'w-max',
  sm: 'w-56',
  md: 'w-64',
  lg: 'w-[280px]',
  xl: 'w-[min(360px,calc(100vw-1.5rem))]',
} as const

function getPositionClass(
  side: PopoverSide,
  align: PopoverAlign,
  gap: 'sm' | 'md',
): string {
  const map = gap === 'md' ? positionClassMd : positionClassSm
  return map[`${side}-${align}`]
}

type PopoverMenuContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverMenuContext = createContext<PopoverMenuContextValue | null>(null)

function usePopoverMenuContext() {
  const context = useContext(PopoverMenuContext)
  if (!context) {
    throw new Error('PopoverMenu 하위 컴포넌트는 PopoverMenu 안에서 사용해야 합니다.')
  }
  return context
}

/** PopoverMenu 내부에서 닫기 등에 사용 */
export function usePopoverMenu() {
  return usePopoverMenuContext()
}

interface PopoverMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/** relative 래퍼 + click-outside + open 상태 */
export function PopoverMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  className,
}: PopoverMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  function setOpen(nextOpen: boolean) {
    onOpenChange?.(nextOpen)
    if (!isControlled) setUncontrolledOpen(nextOpen)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, isControlled])

  return (
    <PopoverMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={cn('relative', className)}>
        {children}
      </div>
    </PopoverMenuContext.Provider>
  )
}

interface PopoverMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function PopoverMenuTrigger({
  asChild = false,
  onClick,
  ...props
}: PopoverMenuTriggerProps) {
  const { open, setOpen } = usePopoverMenuContext()
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      aria-expanded={open}
      onClick={(event) => {
        onClick?.(event as React.MouseEvent<HTMLButtonElement>)
        if (!event.defaultPrevented) setOpen(!open)
      }}
      {...props}
    />
  )
}

interface PopoverMenuPanelProps {
  children: ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  width?: keyof typeof widthClass
  className?: string
  /** 내부 p-3 패딩 (기본 true) */
  padded?: boolean
  /** bottom/top 간격: sm=1.5, md=2 */
  gap?: 'sm' | 'md'
}

/** chat-settings-panel과 동일한 플로팅 패널 스타일 */
export function PopoverMenuPanel({
  children,
  side = 'bottom',
  align = 'end',
  width = 'auto',
  gap = 'sm',
  className,
  padded = true,
}: PopoverMenuPanelProps) {
  return (
    <div
      className={cn(
        'absolute z-50 inline-flex max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl bg-card shadow-lg',
        getPositionClass(side, align, gap),
        widthClass[width],
        className,
      )}
    >
      {padded ? <div className="p-3">{children}</div> : children}
    </div>
  )
}

export function PopoverMenuContent({
  side,
  align,
  width,
  gap,
  className,
  padded,
  children,
}: PopoverMenuPanelProps) {
  const { open } = usePopoverMenuContext()
  if (!open) return null

  return (
    <PopoverMenuPanel
      side={side}
      align={align}
      width={width}
      gap={gap}
      className={className}
      padded={padded}
    >
      {children}
    </PopoverMenuPanel>
  )
}

interface PopoverMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  label: ReactNode
  description?: ReactNode
  trailing?: ReactNode
  showChevron?: boolean
  selected?: boolean
}

/** chat-settings SettingsMenuRow 스타일 */
export function PopoverMenuItem({
  icon,
  label,
  description,
  trailing,
  showChevron = false,
  selected = false,
  className,
  type = 'button',
  ...props
}: PopoverMenuItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/40 disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon ? (
          <span className="shrink-0 text-muted-foreground">{icon}</span>
        ) : null}
        <div className="min-w-0">
          <span className="block truncate text-[13px] font-medium text-foreground/90">
            {label}
          </span>
          {description ? (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
      </div>
      {trailing ? (
        <span className="shrink-0 text-sm text-muted-foreground">{trailing}</span>
      ) : selected ? (
        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      ) : showChevron ? (
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
          aria-hidden
        />
      ) : null}
    </button>
  )
}

interface PopoverMenuLinkProps {
  href: string
  icon?: ReactNode
  label: ReactNode
  showChevron?: boolean
  external?: boolean
  className?: string
  onClick?: () => void
}

export function PopoverMenuLink({
  href,
  icon,
  label,
  showChevron = true,
  external = false,
  className,
  onClick,
}: PopoverMenuLinkProps) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon ? (
          <span className="shrink-0 text-muted-foreground">{icon}</span>
        ) : null}
        <span className="truncate text-[13px] font-medium text-foreground/90">
          {label}
        </span>
      </div>
      {showChevron ? (
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
          aria-hidden
        />
      ) : null}
    </Link>
  )
}

/** 패널 전체 너비 구분선 */
export function PopoverMenuSeparator() {
  return <div className="border-t border-border" aria-hidden />
}

/** chat-settings 설정 메뉴 그룹 배경 */
export function PopoverMenuGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl bg-muted/15 p-1.5', className)}>{children}</div>
  )
}

export function PopoverMenuDivider({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-muted', className)} aria-hidden />
}

interface PopoverMenuSectionProps {
  title?: ReactNode
  titleIcon?: ReactNode
  children: ReactNode
  className?: string
}

/** 섹션 헤더 + 내용 (추천 답변 등) */
export function PopoverMenuSection({
  title,
  titleIcon,
  children,
  className,
}: PopoverMenuSectionProps) {
  return (
    <div className={className}>
      {title ? (
        <div className="mb-2 flex items-center gap-1.5">
          {titleIcon}
          <p className="text-[12px] font-semibold text-foreground">{title}</p>
        </div>
      ) : null}
      {children}
    </div>
  )
}

/** 추천 답변 등 칩형 선택 옵션 */
export function PopoverMenuOption({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-lg bg-muted/40 px-3 py-2 text-left text-[12px] leading-snug text-foreground transition-colors hover:bg-muted disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** 텍스트-only compact 옵션 (정렬 메뉴 등) */
export function PopoverMenuTextOption({
  children,
  selected = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        'block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-muted/40',
        selected ? 'font-medium text-foreground' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
