'use client'

import { useState, type ReactNode } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type DialogueSymbolMode = 'insert-one' | 'wrap-selection' | 'append-end'

type SubstitutionRule = {
  id: string
  from: string
  to: string
}

const DEFAULT_CONTINUE_PROMPT =
  "Continue the conversation naturally. Please generate {{char}}'s next response that follows from the previous messages."

const CONTINUE_PROMPT_MAX_BYTES = 1000

const DIALOGUE_SYMBOL_OPTIONS: {
  id: DialogueSymbolMode
  label: string
  description: string
}[] = [
  {
    id: 'insert-one',
    label: 'Insert one',
    description: 'Inserts a single symbol at the cursor',
  },
  {
    id: 'wrap-selection',
    label: 'Wrap selection',
    description: 'Wraps the selected text with symbols on both sides',
  },
  {
    id: 'append-end',
    label: 'Append to end',
    description: 'Inserts symbols at the end of the text',
  },
]

function SettingsSectionHeader({
  title,
  trailing,
}: {
  title: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[12px] font-semibold text-foreground">{title}</p>
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
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  )
}

function getUtf8ByteLength(text: string) {
  return new TextEncoder().encode(text).length
}

export function ChatAdvancedSettingsView() {
  const [snowfallEnabled, setSnowfallEnabled] = useState(false)
  const [dialogueSymbolMode, setDialogueSymbolMode] =
    useState<DialogueSymbolMode>('wrap-selection')
  const [continuePrompt, setContinuePrompt] = useState(DEFAULT_CONTINUE_PROMPT)
  const [substitutionEnabled, setSubstitutionEnabled] = useState(false)
  const [substitutionRules, setSubstitutionRules] = useState<SubstitutionRule[]>([])

  const continuePromptBytes = getUtf8ByteLength(continuePrompt)

  function handleResetContinuePrompt() {
    setContinuePrompt(DEFAULT_CONTINUE_PROMPT)
  }

  function handleUseDefaultContinuePrompt() {
    setContinuePrompt(DEFAULT_CONTINUE_PROMPT)
    toast.success('Default prompt applied.')
  }

  function handleAddSubstitutionRule() {
    if (!substitutionEnabled) {
      toast.message('Enable text substitution first.')
      return
    }

    setSubstitutionRules((rules) => [
      ...rules,
      { id: `rule-${Date.now()}`, from: '', to: '' },
    ])
  }

  function handleContinuePromptChange(value: string) {
    if (getUtf8ByteLength(value) > CONTINUE_PROMPT_MAX_BYTES) return
    setContinuePrompt(value)
  }

  return (
    <div className="w-full min-w-0 space-y-3 pb-1">
      <div className="space-y-2">
        <SettingsSectionHeader title="Chat effects" />
        <SettingsCard>
          <SettingsToggleRow
            title="Snowfall in Chat"
            description="Show a snowfall effect in the chat room."
            checked={snowfallEnabled}
            onCheckedChange={setSnowfallEnabled}
          />
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader title="Action/Dialogue symbols" />
        <SettingsCard className="space-y-2">
          {DIALOGUE_SYMBOL_OPTIONS.map((option, index) => {
            const isSelected = dialogueSymbolMode === option.id

            return (
              <div key={option.id}>
                {index > 0 ? <div className="mb-2 border-t border-border" aria-hidden /> : null}
                <button
                  type="button"
                  onClick={() => setDialogueSymbolMode(option.id)}
                  className="flex w-full items-start gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-muted/30"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/40 bg-transparent',
                    )}
                    aria-hidden
                  >
                    {isSelected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-foreground">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              </div>
            )
          })}
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader
          title="Continue Generation Prompt"
          trailing={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseDefaultContinuePrompt}
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Default
              </button>
              <button
                type="button"
                onClick={handleResetContinuePrompt}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Reset
              </button>
            </div>
          }
        />
        <p className="text-[11px] leading-snug text-muted-foreground">
          The default instruction sent to AI when you press the Send button. If left
          empty, the system default will be used.
        </p>
        <div className="relative">
          <Textarea
            value={continuePrompt}
            onChange={(event) => handleContinuePromptChange(event.target.value)}
            rows={3}
            className="min-h-[80px] pb-10 text-[13px]"
            aria-label="Continue generation prompt"
          />
          <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">
              {'{{char}}'} = Character name, {'{{user}}'} = User name
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {continuePromptBytes.toLocaleString('en-US')} /{' '}
              {CONTINUE_PROMPT_MAX_BYTES.toLocaleString('en-US')} Byte
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SettingsSectionHeader title="Text substitution" />
        <SettingsCard className="space-y-3">
          <SettingsToggleRow
            title="Enable text substitution"
            checked={substitutionEnabled}
            onCheckedChange={setSubstitutionEnabled}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-foreground">Rules</span>
            <button
              type="button"
              onClick={handleAddSubstitutionRule}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add rule
            </button>
          </div>

          {substitutionRules.length === 0 ? (
            <div className="flex min-h-[64px] items-center justify-center rounded-xl border border-dashed border-border px-3 py-4 text-center">
              <p className="text-[12px] text-muted-foreground">
                No substitution rules yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {substitutionRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-lg border border-border bg-background/40 px-3 py-2 text-[12px] text-muted-foreground"
                >
                  Rule {rule.id.replace('rule-', '')}
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] leading-snug text-muted-foreground">
            Rules are applied in order, and JSX or image syntax can also change, so
            use them with care. Rules are stored only in this browser.
          </p>
        </SettingsCard>
      </div>
    </div>
  )
}
