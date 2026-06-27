'use client'

import { useRef, useState, type ReactNode } from 'react'
import {
  Check,
  ChevronDown,
  Minus,
  Monitor,
  Palette,
  Plus,
  RotateCcw,
  Triangle,
  Type,
} from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type ThemeStyle = 'default' | 'messenger' | 'novel'

type ChatWidth = 'compact' | 'normal' | 'wide'

type LineSpacing = 'Narrow' | 'Normal' | 'Wide'

type ChatColors = {
  baseText: string
  quotedSpeech: string
  innerThoughts: string
}

const DEFAULT_COLORS: ChatColors = {
  baseText: '#fafafa',
  quotedSpeech: '#e8c4a8',
  innerThoughts: '#93c5fd',
}

const FONT_OPTIONS = ['Pretendard', 'Noto Sans KR', 'IBM Plex Sans KR'] as const

const FONT_SIZES = [12, 13, 14, 15, 16, 18] as const

const LINE_SPACINGS: LineSpacing[] = ['Narrow', 'Normal', 'Wide']

const CHAT_WIDTH_LABELS: Record<ChatWidth, string> = {
  compact: 'Compact (2XL)',
  normal: 'Normal (3XL)',
  wide: 'Wide (4XL)',
}

const THEME_OPTIONS: { id: ThemeStyle; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'messenger', label: 'Messenger' },
  { id: 'novel', label: 'Novel' },
]

function SettingsSectionHeader({
  icon,
  title,
  trailing,
}: {
  icon: ReactNode
  title: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-[12px] font-semibold text-foreground">{title}</p>
      </div>
      {trailing}
    </div>
  )
}

function SettingsCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl bg-muted/25 p-3', className)}>{children}</div>
  )
}

function SettingsToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  )
}

function ThemeStylePreview({ style }: { style: ThemeStyle }) {
  if (style === 'messenger') {
    return (
      <div className="flex flex-col gap-1.5 px-1">
        <div className="h-2 w-10 rounded-full bg-muted-foreground/30" />
        <div className="ml-auto h-2 w-8 rounded-full bg-primary/50" />
      </div>
    )
  }

  if (style === 'novel') {
    return (
      <div className="px-1 text-center">
        <p className="text-[8px] leading-snug text-muted-foreground italic">
          Traveler, would you like to go for a walk with me?
        </p>
        <p className="mt-1 text-[7px] text-muted-foreground/70">
          Elyn smiled softly as she spoke.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-1.5 px-1">
      <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-muted-foreground/35" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4/5 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  )
}

function ThemeStyleCard({
  label,
  style,
  selected,
  onSelect,
}: {
  label: string
  style: ThemeStyle
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border p-2 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/20 hover:bg-muted/30',
      )}
    >
      {selected ? (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-2.5 w-2.5" aria-hidden />
        </span>
      ) : null}
      <div className="flex h-12 items-center justify-center rounded-lg bg-background/60">
        <ThemeStylePreview style={style} />
      </div>
      <span className="text-center text-[11px] font-medium text-foreground">{label}</span>
    </button>
  )
}

function SettingsDropdown({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  ariaLabel: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-muted/40"
      >
        {value}
        <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
      </button>
      {isOpen ? (
        <div className="absolute right-0 z-10 mt-1 min-w-[140px] rounded-lg border border-border bg-card py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-[12px] transition-colors hover:bg-muted/40',
                option === value
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StepperRow({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: {
  label: string
  value: string
  onDecrease: () => void
  onIncrease: () => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-primary">{value}</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            disabled={decreaseDisabled}
            onClick={onDecrease}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label={`Increase ${label}`}
            disabled={increaseDisabled}
            onClick={onIncrease}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorPickerRow({
  label,
  color,
  isCheckerboard = false,
  onChange,
}: {
  label: string
  color: string
  isCheckerboard?: boolean
  onChange: (color: string) => void
}) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label={`${label} color`}
        onClick={() => colorInputRef.current?.click()}
        className={cn(
          'h-7 w-7 rounded-full border border-border shadow-sm',
          isCheckerboard &&
            'bg-[linear-gradient(45deg,#808080_25%,transparent_25%),linear-gradient(-45deg,#808080_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#808080_75%),linear-gradient(-45deg,transparent_75%,#808080_75%)] bg-size-[8px_8px] bg-position-[0_0,0_4px,4px_-4px,-4px_0px]',
        )}
        style={isCheckerboard ? undefined : { backgroundColor: color }}
      />
      <input
        ref={colorInputRef}
        type="color"
        value={color}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
      />
    </div>
  )
}

export function ChatRoomSettingsView() {
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('default')
  const [showImages, setShowImages] = useState(true)
  const [maxImageWidth, setMaxImageWidth] = useState(false)
  const [showAutoReplies, setShowAutoReplies] = useState(true)
  const [splitImagePreview, setSplitImagePreview] = useState(false)
  const [chatWidth, setChatWidth] = useState<ChatWidth>('normal')
  const [fontFamily, setFontFamily] = useState<(typeof FONT_OPTIONS)[number]>('Pretendard')
  const [fontSizeIndex, setFontSizeIndex] = useState(2)
  const [lineSpacingIndex, setLineSpacingIndex] = useState(2)
  const [colors, setColors] = useState<ChatColors>(DEFAULT_COLORS)

  const fontSize = FONT_SIZES[fontSizeIndex]
  const lineSpacing = LINE_SPACINGS[lineSpacingIndex]

  function handleResetColors() {
    setColors(DEFAULT_COLORS)
  }

  return (
    <div className="w-full min-w-0 space-y-3 pb-1">
      <div className="space-y-2">
        <SettingsSectionHeader
          icon={<Palette className="h-3.5 w-3.5" />}
          title="Theme style"
        />
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => (
            <ThemeStyleCard
              key={option.id}
              label={option.label}
              style={option.id}
              selected={themeStyle === option.id}
              onSelect={() => setThemeStyle(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader
          icon={<Monitor className="h-3.5 w-3.5" />}
          title="Display Settings"
        />
        <SettingsCard className="space-y-3">
          <SettingsToggleRow
            title="Show images"
            description="Displays images inside the chat. When off, image prompts are also omitted from the model input."
            checked={showImages}
            onCheckedChange={setShowImages}
          />
          <div className="border-t border-border" aria-hidden />
          <SettingsToggleRow
            title="Max image width"
            description="Let images fill the full frame instead of fitting to the device width. Great for big scenes."
            checked={maxImageWidth}
            onCheckedChange={setMaxImageWidth}
          />
          <div className="border-t border-border" aria-hidden />
          <SettingsToggleRow
            title="Show auto replies"
            description="Shows suggested replies at the bottom of the chat."
            checked={showAutoReplies}
            onCheckedChange={setShowAutoReplies}
          />
          <div className="border-t border-border" aria-hidden />
          <SettingsToggleRow
            title="Split image preview"
            description="Shows image previews on the left on large screens. Default theme only."
            checked={splitImagePreview}
            onCheckedChange={setSplitImagePreview}
          />
          <div className="border-t border-border" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium text-foreground">Chat width</span>
            <SettingsDropdown
              value={CHAT_WIDTH_LABELS[chatWidth]}
              options={Object.values(CHAT_WIDTH_LABELS)}
              onChange={(label) => {
                const nextWidth = (Object.entries(CHAT_WIDTH_LABELS).find(
                  ([, value]) => value === label,
                )?.[0] ?? 'normal') as ChatWidth
                setChatWidth(nextWidth)
              }}
              ariaLabel="Chat width"
            />
          </div>
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader
          icon={<Type className="h-3.5 w-3.5" />}
          title="Text settings"
        />
        <SettingsCard className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-muted-foreground">Font</span>
            <SettingsDropdown
              value={fontFamily}
              options={FONT_OPTIONS}
              onChange={(value) =>
                setFontFamily(value as (typeof FONT_OPTIONS)[number])
              }
              ariaLabel="Font"
            />
          </div>
          <div className="border-t border-border" aria-hidden />
          <StepperRow
            label="Font size"
            value={`${fontSize}px`}
            decreaseDisabled={fontSizeIndex <= 0}
            increaseDisabled={fontSizeIndex >= FONT_SIZES.length - 1}
            onDecrease={() =>
              setFontSizeIndex((index) => Math.max(0, index - 1))
            }
            onIncrease={() =>
              setFontSizeIndex((index) =>
                Math.min(FONT_SIZES.length - 1, index + 1),
              )
            }
          />
          <div className="border-t border-border" aria-hidden />
          <StepperRow
            label="Line spacing"
            value={lineSpacing}
            decreaseDisabled={lineSpacingIndex <= 0}
            increaseDisabled={lineSpacingIndex >= LINE_SPACINGS.length - 1}
            onDecrease={() =>
              setLineSpacingIndex((index) => Math.max(0, index - 1))
            }
            onIncrease={() =>
              setLineSpacingIndex((index) =>
                Math.min(LINE_SPACINGS.length - 1, index + 1),
              )
            }
          />
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader
          icon={<Triangle className="h-3.5 w-3.5" />}
          title="Color settings"
          trailing={
            <button
              type="button"
              onClick={handleResetColors}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Reset
            </button>
          }
        />
        <SettingsCard className="space-y-3">
          <ColorPickerRow
            label="Base text"
            color={colors.baseText}
            isCheckerboard
            onChange={(baseText) => setColors((prev) => ({ ...prev, baseText }))}
          />
          <div className="border-t border-border" aria-hidden />
          <ColorPickerRow
            label='Quoted speech ("")'
            color={colors.quotedSpeech}
            onChange={(quotedSpeech) =>
              setColors((prev) => ({ ...prev, quotedSpeech }))
            }
          />
          <div className="border-t border-border" aria-hidden />
          <ColorPickerRow
            label="Inner thoughts (')"
            color={colors.innerThoughts}
            onChange={(innerThoughts) =>
              setColors((prev) => ({ ...prev, innerThoughts }))
            }
          />
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-1" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-red-400/80" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
              <span className="h-2 w-2 rounded-full bg-green-400/80" />
            </div>
            <span className="text-[11px] text-muted-foreground">Preview</span>
          </div>
          <div
            className="space-y-2 px-3 py-3"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight:
                lineSpacing === 'Narrow'
                  ? 1.4
                  : lineSpacing === 'Wide'
                    ? 1.9
                    : 1.6,
            }}
          >
            <p style={{ color: colors.innerThoughts }}>
              &apos;The weather is lovely today.&apos;
            </p>
            <p style={{ color: colors.baseText }}>
              Elyn smiled softly as she spoke.
            </p>
            <p style={{ color: colors.quotedSpeech }}>
              &quot;Traveler, would you like to go for a walk with me?&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
