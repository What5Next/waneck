'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ChevronDown, Eye, Plus, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'

import { CHARACTER_GENRE_OPTIONS } from '@/lib/character-genres'
import type { CharacterWithDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Field, TextInput, TextArea, characterFormInputClassName, characterFormDescriptionClassName } from '@/components/ui/form-field'
import { PageNavBar } from '@/components/ui/page-nav-bar'
import { CharacterCreatePreview, type CharacterPreviewView } from '@/components/character-create-preview'
import { BottomSheetContent } from '@/components/ui/bottom-sheet'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { InputDropdown } from '@/components/ui/input-dropdown'
import { UnderlineTabs } from '@/components/ui/underline-tabs'
import { Chip } from '@/components/ui/chip'
import { useCreateCharacter } from '@/hooks/mutations/use-create-character'
import { useUpdateCharacter } from '@/hooks/mutations/use-update-character'
import { buildCharacterPrompt, CHARACTER_TEMPLATE_SECTIONS, EMPTY_CHARACTER_PROMPT, parseCharacterPrompt, type CharacterPromptFields } from '@/lib/character-prompt'
import { organizeCharacterPrompt } from '@/lib/character-prompt-organizer'
import { useDevLanguage } from '@/components/dev-language-provider'
import { characterCreateText } from '@/lib/character-create-copy'

function useFormText() {
  const { language } = useDevLanguage()
  return (english: string) => characterCreateText(language, english)
}

// ─── 탭 정의 ───────────────────────────────────────────────────────────────

type TabId = 'settings' | 'intro' | 'prompt' | 'examples'

const TABS: { id: TabId; label: string; required?: boolean }[] = [
  { id: 'settings', label: 'Character', required: true },
  { id: 'prompt', label: 'Persona', required: true },
  { id: 'intro', label: 'Opening', required: true },
  { id: 'examples', label: 'Advanced' },
]

const TAB_ORDER: TabId[] = TABS.map((t) => t.id)

const TAB_INTROS: Record<TabId, { title: string; description: string }> = {
  settings: { title: 'Character', description: 'Set the profile people will see.' },
  prompt: { title: 'Persona', description: 'Define one character and the story they share with the user.' },
  intro: { title: 'Opening', description: 'Write the scene shown when a new chat begins.' },
  examples: { title: 'Advanced', description: 'Add example dialogues and images for specific moments.' },
}

// ─── 폼 상태 ───────────────────────────────────────────────────────────────

type IntroTurn = { role: 'user' | 'model'; text: string }
type SituationImageDraft = { imageUrl: string; label: string; file?: File }

type FormState = {
  imageUrl: string
  name: string
  tagline: string
  introTurns: IntroTurn[]
  prompt: CharacterPromptFields
  genres: string[]
  desc: string
  suggestions: string[]
  situationImages: SituationImageDraft[]
}

const DEFAULT_FORM: FormState = {
  imageUrl: '',
  name: '',
  tagline: '',
  introTurns: [
    { role: 'model', text: '' },
  ],
  prompt: EMPTY_CHARACTER_PROMPT,
  genres: [],
  desc: '',
  suggestions: ['', '', ''],
  situationImages: [],
}

function toFormState(character: CharacterWithDetail): FormState {
  const suggestions = Array.isArray(character.suggestions)
    ? character.suggestions.filter((s): s is string => typeof s === 'string')
    : []

  return {
    imageUrl: character.profile_image_url ?? '',
    name: character.name,
    tagline: character.short_intro ?? '',
    introTurns:
      character.intro_messages.length > 0
        ? character.intro_messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.content,
          }))
        : [{ role: 'model', text: '' }],
    prompt: parseCharacterPrompt(character.system_prompt),
    genres: character.genres ?? [],
    desc: character.description ?? '',
    suggestions: [suggestions[0] ?? '', suggestions[1] ?? '', suggestions[2] ?? ''],
    situationImages: (character.situation_images ?? []).map((image) => ({ imageUrl: image.image_url, label: image.label ?? '' })),
  }
}

// ─── 탭 1: 캐릭터 설정 ────────────────────────────────────────────────────

function SettingsTab({
  form,
  setForm,
  onFileChange,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onFileChange: (file: File | null) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const t = useFormText()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onFileChange(file)
    const url = URL.createObjectURL(file)
    setForm((f) => ({ ...f, imageUrl: url }))
  }

  function toggleGenre(genre: string) {
    setForm((current) => ({
      ...current,
      genres: current.genres.includes(genre)
        ? current.genres.filter((item) => item !== genre)
        : [...current.genres, genre],
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 캐릭터 이미지 */}
      <Field label={t('Character image')} required>
        <div className="flex items-center gap-4">
          {/* 이미지 프리뷰 */}
          <div className="relative h-28 w-[84px] shrink-0 overflow-hidden rounded-xl bg-muted/40">
            {form.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt={t('Character image')}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { onFileChange(null); setForm((f) => ({ ...f, imageUrl: '' })); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label={t('Remove image')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-9 w-9 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="pill"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {t('Upload')}
            </Button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </Field>

      {/* 캐릭터 이름 */}
      <Field label={t('Character name')} required>
        <TextInput
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder={t('e.g. Mara Voss')}
          maxLength={30}
        />
      </Field>

      {/* 한 줄 소개 */}
      <Field
        label={t('Tagline')}
        required
        hint={t('Introduce your character in one sentence')}
      >
        <TextInput
          value={form.tagline}
          onChange={(v) => setForm((f) => ({ ...f, tagline: v }))}
          placeholder={t("e.g. An archivist who hears the truth in erased voices.")}
          maxLength={50}
        />
      </Field>

      {/* 장르 (복수 선택) */}
      <Field label={t('Genres')} required hint={t('Pick categories that fit your character')}>
        <div className="flex flex-wrap gap-2">
          {CHARACTER_GENRE_OPTIONS.map((genre) => (
            <Chip
              key={genre}
              selected={form.genres.includes(genre)}
              onClick={() => toggleGenre(genre)}
            >
              {t(genre)}
            </Chip>
          ))}
        </div>
      </Field>

      {/* 상세 소개 */}
      <Field
        label={t('Full description')}
        required
        hint={t('Shown on the character detail page')}
      >
        <TextArea
          value={form.desc}
          onChange={(v) => setForm((f) => ({ ...f, desc: v }))}
          placeholder={t('e.g. Mara Voss, 29, restores damaged recordings. After a studio fire took her colleague, she began keeping copies of files someone wanted erased.')}
          rows={5}
          maxLength={300}
        />
      </Field>
    </div>
  )
}

// ─── 탭 2: 인트로 ─────────────────────────────────────────────────────────

function IntroTab({
  form,
  setForm,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const t = useFormText()
  function updateSuggestion(idx: number, value: string) {
    setForm((f) => {
      const suggestions = [...f.suggestions]
      suggestions[idx] = value
      return { ...f, suggestions }
    })
  }

  function updateTurn(idx: number, key: keyof IntroTurn, value: string) {
    setForm((f) => {
      const turns = [...f.introTurns]
      turns[idx] = { ...turns[idx], [key]: value }
      return { ...f, introTurns: turns }
    })
  }

  function addTurn() {
    setForm((f) => ({
      ...f,
      introTurns: [
        ...f.introTurns,
        { role: f.introTurns.at(-1)?.role === 'model' ? 'user' : 'model', text: '' },
      ],
    }))
  }

  function removeTurn(idx: number) {
    setForm((f) => ({
      ...f,
      introTurns: f.introTurns.filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label={t('Current situation')} hint={t('Where does the conversation begin? What is happening right now?')}>
        <TextArea
          value={form.prompt.scenario}
          onChange={(value) => setForm((current) => ({ ...current, prompt: { ...current.prompt, scenario: value } }))}
          placeholder={t('e.g. The archive closes in ten minutes. A recording has vanished, and the user is the last person who checked it out.')}
          rows={4}
          maxLength={1400}
        />
      </Field>
      <Field
        label={t('Starting messages')}
        required
        hint={t("This appears when a chat starts. Show the character's voice and give the user a reason to respond.")}
      >
        <div className="flex flex-col">
          {form.introTurns.map((turn, idx) => (
            <div key={idx} className="flex flex-col gap-2 border-t border-border/60 py-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{t('Message')} {idx + 1}</span>
                <InputDropdown
                  value={turn.role}
                  onValueChange={(value) => updateTurn(idx, 'role', value)}
                  options={[{ value: 'user', label: t('User') }, { value: 'model', label: t('Character') }]}
                  variant="pill"
                  aria-label={t('Speaker')}
                  triggerClassName="border-0 bg-muted/35 px-2.5 text-foreground hover:bg-muted/50"
                />
                {form.introTurns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTurn(idx)}
                    aria-label={t('Remove message')}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <TextArea
                value={turn.text}
                onChange={(v) => updateTurn(idx, 'text', v)}
                placeholder={t(turn.role === 'user' ? 'User message' : 'Character reply')}
                rows={2}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 gap-1.5 self-start px-2 text-sm text-foreground hover:bg-muted/40"
            onClick={addTurn}
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Add message')}
          </Button>
        </div>
      </Field>
      {/* 추천 대화 */}
      <Field
        label={t('Suggested replies')}
        hint={t('Up to 3 conversation starters shown in chat')}
      >
        <div className="flex flex-col gap-2">
          {form.suggestions.map((s, idx) => (
            <TextInput
              key={idx}
              value={s}
              onChange={(v) => updateSuggestion(idx, v)}
              placeholder={`${t('Suggested reply')} ${idx + 1}`}
              maxLength={40}
            />
          ))}
        </div>
      </Field>
    </div>
  )
}

// ─── 탭 3: 프롬프트 ───────────────────────────────────────────────────────

function PromptTab({
  form,
  setForm,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const t = useFormText()
  const [detailsOpen, setDetailsOpen] = useState(() => Boolean(
    Object.values(form.prompt.template).some((value) => value.trim()) ||
    ['personality', 'backstory', 'relationship', 'session', 'voice', 'reactions', 'dialogueRules', 'progressionRules', 'eventRules', 'additional'].some((key) => form.prompt[key as keyof CharacterPromptFields]?.toString().trim()),
  ))
  const [openGroups, setOpenGroups] = useState<string[]>(['character'])
  function update(key: keyof CharacterPromptFields, value: string) {
    setForm((current) => ({ ...current, prompt: { ...current.prompt, [key]: value } }))
  }
  function updateTemplate(key: keyof CharacterPromptFields['template'], value: string) {
    setForm((current) => ({ ...current, prompt: { ...current.prompt, template: { ...current.prompt.template, [key]: value } } }))
  }
  function organizePrompt() {
    const organized = organizeCharacterPrompt(form.prompt.identity)
    const keys = ['personality', 'backstory', 'relationship', 'session', 'voice', 'reactions', 'dialogueRules', 'progressionRules', 'eventRules', 'additional'] as const
    const filled = keys.filter((key) => !form.prompt[key].trim() && organized[key].trim()).length +
      (Object.keys(form.prompt.template) as Array<keyof CharacterPromptFields['template']>)
        .filter((key) => !form.prompt.template[key].trim() && organized.template[key].trim()).length
    setForm((current) => {
      const prompt = { ...current.prompt, template: { ...current.prompt.template } }
      for (const key of keys) {
        const value = organized[key]
        if (!prompt[key].trim() && value.trim()) {
          prompt[key] = value.trim()
        }
      }
      for (const key of Object.keys(prompt.template) as Array<keyof CharacterPromptFields['template']>) {
        const value = organized.template[key]
        if (!prompt.template[key].trim() && value.trim()) {
          prompt.template[key] = value.trim()
        }
      }
      return { ...current, prompt }
    })
    setDetailsOpen(true)
    setOpenGroups(['character', 'relationship', 'world', 'rules'])
    if (filled) toast.success(t('Character concept organized into detailed settings.'))
    else toast.info(t('No matching empty fields were found. The original text is unchanged.'))
  }
  const templateField = (section: typeof CHARACTER_TEMPLATE_SECTIONS[number]) => (
    <Field key={section.key} label={t(section.title)} hint={t(section.guide)}>
      <TextArea value={form.prompt.template[section.key]} onChange={(value) => updateTemplate(section.key, value)}
        placeholder={`${t('e.g. ')}${t(section.example)}`} rows={4} maxLength={4000} />
    </Field>
  )
  const group = (id: string, title: string, description: string, content: React.ReactNode) => (
    <div key={id} className="rounded-xl border border-border bg-card/30">
      <button type="button" aria-expanded={openGroups.includes(id)} onClick={() => setOpenGroups((groups) => groups.includes(id) ? groups.filter((groupId) => groupId !== id) : [...groups, id])}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left">
        <span><span className="block text-base font-semibold text-foreground">{t(title)}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{t(description)}</span></span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openGroups.includes(id) ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {openGroups.includes(id) && <div className="flex flex-col gap-5 border-t border-border/60 px-4 py-5">{content}</div>}
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <Field label={t('Character concept')}
        hint={t('Write or paste one character’s personality, voice, appearance, relationship with the user, and story rules.')}>
        <TextArea value={form.prompt.identity} onChange={(v) => update('identity', v)}
          placeholder={t('e.g. Mara Voss is a guarded audio archivist looking for a missing recording. She speaks briefly, notices lies in voices, and slowly learns to trust the user.')}
          rows={8} className="min-h-[420px] max-h-none resize-y font-mono text-sm leading-relaxed" maxLength={20000} />
      </Field>
      <button type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-4 text-left hover:bg-muted/40">
        <span><span className="block text-base font-semibold text-foreground">{t('Detailed settings')}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{t('Fill only the sections you need. Freeform text stays separate.')}</span></span>
        <ChevronDown className={`ml-3 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${detailsOpen ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {detailsOpen && <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-muted-foreground">{t('Bring sections from the Character concept above into empty detailed fields.')}</p>
          <Button type="button" variant="outline" size="sm" onClick={organizePrompt} disabled={!form.prompt.identity.trim()}>
            {t('Fill from Character concept')}
          </Button>
        </div>
        {group('character', 'Character details', 'Personality, voice, appearance, history, and habits.', <>
          {templateField(CHARACTER_TEMPLATE_SECTIONS[0])}
          <Field label={t('Personality and inner conflict')} hint={t('Describe their usual traits, reactions in special situations, and core disposition.')}>
            <TextArea value={form.prompt.personality} onChange={(v) => update('personality', v)} placeholder={t('e.g. Mara checks every detail but hides her own mistakes. She wants a partner she can trust, yet tests people by sharing only half of what she knows.')} rows={5} maxLength={1800} />
          </Field>
          <Field label={t('Voice and dialogue style')} hint={t('Describe everyday, emotional, and special-situation speech, plus recurring words.')}>
            <TextArea value={form.prompt.voice} onChange={(v) => update('voice', v)} placeholder={t('e.g. Mara speaks in short, precise sentences and never uses emojis. When worried, she says “Check the timestamp” instead of “Be careful.”')} rows={4} maxLength={1400} />
          </Field>
          {CHARACTER_TEMPLATE_SECTIONS.slice(1, 9).map(templateField)}
          <Field label={t('Backstory and world')} hint={t('Only include history or setting details that should shape replies.')}>
            <TextArea value={form.prompt.backstory} onChange={(v) => update('backstory', v)} placeholder={t('e.g. Three years ago, Mara lost a colleague in a studio fire. Since then, she has secretly kept copies of recordings the company ordered destroyed.')} rows={4} maxLength={1600} />
          </Field>
          <Field label={t('Reactions and boundaries')} hint={t("Describe how this person responds to disagreement, affection, danger, or secrets. Avoid generic 'always kind' rules.")}>
            <TextArea value={form.prompt.reactions} onChange={(v) => update('reactions', v)} placeholder={t("e.g. If accused, Mara asks to see the evidence before defending herself. If the user pulls away, she waits instead of following; she never decides their actions.")} rows={4} maxLength={1400} />
          </Field>
          {templateField(CHARACTER_TEMPLATE_SECTIONS[17])}
        </>)}
        {group('relationship', 'User and starting setup', 'Define the user’s role, their connection, and the opening conflict.', <>
          <Field label={t('Relationship with the user')} hint={t('Define what they know about the user, what they want from them, and how trust changes.')}>
            <TextArea value={form.prompt.relationship} onChange={(v) => update('relationship', v)} placeholder={t('e.g. The user is Mara’s new partner on the case. She shares evidence but avoids personal questions; she opens up if the user protects a secret.')} rows={4} maxLength={1400} />
          </Field>
          <Field label={t('Session and starting setup')} hint={t('Set the user’s role, shared goal, central conflict, and where the story begins.')}>
            <TextArea value={form.prompt.session} onChange={(v) => update('session', v)} placeholder={t('e.g. The user joins Mara in the archive on their first night shift. They have seven days to find a missing recording before the archive closes.')} rows={5} maxLength={4000} />
          </Field>
        </>)}
        {group('world', 'World and setting', 'Add only the places and rules the two of you need for the story.', <>
          {CHARACTER_TEMPLATE_SECTIONS.slice(9, 15).map(templateField)}
          {templateField(CHARACTER_TEMPLATE_SECTIONS[16])}
        </>)}
        {group('rules', 'Dialogue and story rules', 'Guide the character’s speech, pace, events, and state changes.', <>
          <Field label={t('Dialogue rules')} hint={t('Describe narration, formatting, and what the character should never decide for the user.')}>
            <TextArea value={form.prompt.dialogueRules} onChange={(v) => update('dialogueRules', v)} placeholder={t('e.g. Put actions in italics. Keep Mara’s dialogue concise. Never write the user’s speech or actions.')} rows={4} maxLength={4000} />
          </Field>
          <Field label={t('Story progression and state')} hint={t('Describe how trust, clues, or other story states should change.')}>
            <TextArea value={form.prompt.progressionRules} onChange={(v) => update('progressionRules', v)} placeholder={t('e.g. Trust rises slowly after shared discoveries. At the end of each reply, show the current clue and trust level.')} rows={4} maxLength={4000} />
          </Field>
          <Field label={t('Timed events')} hint={t('Add milestones or events that should happen at specific story moments.')}>
            <TextArea value={form.prompt.eventRules} onChange={(v) => update('eventRules', v)} placeholder={t('e.g. On the third night, a new recording appears in the archive. Reveal it only after the user checks the storage room.')} rows={4} maxLength={4000} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t('Viewpoint')}><InputDropdown value={form.prompt.viewpoint} onValueChange={(value) => update('viewpoint', value)} options={[{ value: 'automatic', label: t('Automatic') }, { value: 'first', label: t('First person') }, { value: 'second', label: t('Second person') }, { value: 'third', label: t('Third person') }]} triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Viewpoint')} /></Field>
            <Field label={t('Pace')}><InputDropdown value={form.prompt.pacing} onValueChange={(value) => update('pacing', value)} options={[{ value: 'natural', label: t('Natural') }, { value: 'slow', label: t('Slow') }, { value: 'fast', label: t('Fast') }]} triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Pace')} /></Field>
            <Field label={t('Reply length')}><InputDropdown value={form.prompt.replyLength} onValueChange={(value) => update('replyLength', value)} options={[{ value: 'adaptive', label: t('Adaptive') }, { value: 'short', label: t('Short') }, { value: 'medium', label: t('Medium') }, { value: 'long', label: t('Long') }]} triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Reply length')} /></Field>
          </div>
          <Field label={t('Extra instructions')} hint={t("Optional advanced rules. Existing characters' old prompts appear here and remain intact.")}>
            <TextArea value={form.prompt.additional} onChange={(v) => update('additional', v)} placeholder={t('e.g. Do not reveal who erased the recording before the user finds a clue. Keep Mara’s knowledge limited to what she has seen or heard.')} rows={4} maxLength={2500} />
          </Field>
        </>)}
      </div>}
    </div>
  )
}

function ExamplesTab({ form, setForm }: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const t = useFormText()
  function update(index: number, key: 'user' | 'character', value: string) {
    setForm((current) => ({ ...current, prompt: {
      ...current.prompt,
      examples: current.prompt.examples.map((example, i) => i === index ? { ...example, [key]: value } : example),
    } }))
  }

  function updateSituationImage(index: number, patch: Partial<SituationImageDraft>) {
    setForm((current) => ({
      ...current,
      situationImages: current.situationImages.map((image, i) => i === index ? { ...image, ...patch } : image),
    }))
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
      {form.prompt.examples.map((example, index) => (
        <div key={index} className="flex flex-col gap-3 border-t border-border/60 py-5 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{t('Example')} {index + 1}</h2>
            {form.prompt.examples.length > 1 && <button type="button" aria-label={`${t('Remove example')} ${index + 1}`}
              onClick={() => setForm((current) => ({ ...current, prompt: { ...current.prompt,
                examples: current.prompt.examples.filter((_, i) => i !== index),
              } }))} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
          <Field label={t('User says')}><TextArea value={example.user} onChange={(v) => update(index, 'user', v)}
            placeholder={t("e.g. I think you're hiding something.")} rows={2} maxLength={500} /></Field>
          <Field label={t('Character replies')}><TextArea value={example.character} onChange={(v) => update(index, 'character', v)}
            placeholder={t('Write the exact kind of reply you want: words, pacing, and actions.')} rows={3} maxLength={1000} /></Field>
        </div>
      ))}
      {form.prompt.examples.length < 3 && <Button type="button" variant="ghost" size="sm" className="self-start gap-1.5 px-2 text-sm text-foreground hover:bg-muted/40"
        onClick={() => setForm((current) => ({ ...current, prompt: { ...current.prompt,
          examples: [...current.prompt.examples, { user: '', character: '' }],
        } }))}><Plus className="h-4 w-4" /> {t('Add example')}</Button>}
      </div>

      <section className="border-t border-border pt-6">
        <h3 className="text-base font-semibold text-foreground">{t('Situation images')}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('Show an uploaded image when a chat message contains the trigger phrase.')}</p>
        <div className="mt-4 flex flex-col gap-4">
          {form.situationImages.map((image, index) => (
            <div key={index} className="rounded-xl border border-border bg-card/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">{t('Situation image')} {index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm((current) => ({
                  ...current,
                  situationImages: current.situationImages.filter((_, i) => i !== index),
                }))}>{t('Remove image')}</Button>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <label className="flex h-32 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-muted/40 text-sm text-muted-foreground">
                  {image.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.imageUrl} alt={t('Situation image')} className="h-full w-full object-cover" />
                  ) : <><Upload className="mr-1 size-4" />{t('Upload')}</>}
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) updateSituationImage(index, { imageUrl: URL.createObjectURL(file), file })
                  }} />
                </label>
                <div className="min-w-0 flex-1">
                  <Field label={t('Trigger phrase')} hint={t('Use a short, specific phrase from a user or character message.')}>
                    <TextInput value={image.label} onChange={(value) => updateSituationImage(index, { label: value })}
                      placeholder={t('e.g. The recording has vanished')} maxLength={120} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>
        {form.situationImages.length < 5 ? (
          <Button type="button" variant="ghost" size="sm" className="mt-3 gap-1.5 px-2 text-sm text-foreground"
            onClick={() => setForm((current) => ({ ...current, situationImages: [...current.situationImages, { imageUrl: '', label: '' }] }))}>
            <Plus className="size-4" />{t('Add situation image')}
          </Button>
        ) : null}
      </section>
    </div>
  )
}

// ─── 메인 폼 ──────────────────────────────────────────────────────────────

type CharacterCreateFormProps = {
  mode?: 'create' | 'edit'
  characterId?: string
  initialData?: CharacterWithDetail
}

export function CharacterCreateForm({
  mode = 'create',
  characterId,
  initialData,
}: CharacterCreateFormProps = {}) {
  const t = useFormText()
  const router = useRouter()
  const createCharacterMutation = useCreateCharacter()
  const updateCharacterMutation = useUpdateCharacter(characterId ?? '')
  const [activeTab, setActiveTab] = useState<TabId>('settings')
  const [previewView, setPreviewView] = useState<CharacterPreviewView>('profile')
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [form, setForm] = useState<FormState>(() =>
    initialData ? toFormState(initialData) : DEFAULT_FORM,
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentIdx = TAB_ORDER.indexOf(activeTab)
  const isLast = currentIdx === TAB_ORDER.length - 1

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error ?? 'Image upload failed')
    }
    const { publicUrl } = await res.json()
    return publicUrl
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      // undefined = 이미지 변경 없음(기존 값 유지), null = 사용자가 이미지를 제거함
      let profileImageUrl: string | null | undefined
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile)
      } else if (mode === 'edit' && !form.imageUrl) {
        profileImageUrl = null
      }

      const situationImages = await Promise.all(form.situationImages.map(async (image) => ({
        image_url: image.file ? await uploadImage(image.file) : image.imageUrl,
        label: image.label.trim(),
      })))

      const payload = {
        name: form.name,
        short_intro: form.tagline,
        system_prompt: buildCharacterPrompt(form.name, form.prompt),
        genres: form.genres,
        description: form.desc,
        suggestions: form.suggestions.filter(Boolean),
        introTurns: form.introTurns,
        situationImages,
        ...(profileImageUrl !== undefined
          ? { profile_image_url: profileImageUrl }
          : {}),
      }

      if (mode === 'edit' && characterId) {
        const updated = await updateCharacterMutation.mutateAsync(payload)
        setImageFile(null)
        setForm((f) => ({ ...f, imageUrl: updated.profile_image_url ?? '', situationImages: situationImages.map((image) => ({ imageUrl: image.image_url, label: image.label })) }))
        toast.success(t('Saved'))
      } else {
        const data = await createCharacterMutation.mutateAsync(payload)
        router.push(`/characters/${data.id}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Failed to save'))
    } finally {
      setSubmitting(false)
    }
  }

  function selectTab(tab: TabId) {
    setActiveTab(tab)
    setPreviewView(tab === 'intro' ? 'chat' : tab === 'examples' ? 'examples' : 'profile')
  }

  function goNext() {
    if (isLast) {
      handleSubmit()
    } else {
      selectTab(TAB_ORDER[currentIdx + 1])
    }
  }

  function goPrevious() {
    if (currentIdx > 0) selectTab(TAB_ORDER[currentIdx - 1])
  }

  // edit 모드에서는 특정 탭만 수정하고 바로 저장할 수 있어야 하므로
  // 전체 폼 기준으로 필수값을 검증한다 (현재 탭 기준이 아님).
  const personaComplete =
    Boolean(form.prompt.identity.trim() || form.prompt.personality.trim() ||
      form.prompt.backstory.trim() || form.prompt.relationship.trim() ||
      form.prompt.voice.trim() || form.prompt.reactions.trim() || form.prompt.additional.trim() ||
      form.prompt.session.trim() || form.prompt.dialogueRules.trim() || form.prompt.progressionRules.trim() || form.prompt.eventRules.trim() ||
      Object.values(form.prompt.template).some((value) => value.trim()))
  const examplesComplete = form.prompt.examples.every((example) =>
    Boolean(example.user.trim()) === Boolean(example.character.trim()),
  )
  const settingsComplete =
    form.imageUrl.trim().length > 0 &&
    form.name.trim().length > 0 &&
    form.tagline.trim().length > 0 &&
    form.genres.length > 0 &&
    form.desc.trim().length > 0
  const isFormValid =
    settingsComplete &&
    (personaComplete || (mode === 'edit' && form.prompt.additional.trim().length > 0)) &&
    form.introTurns.every((t) => t.text.trim().length > 0) &&
    examplesComplete &&
    form.situationImages.every((image) => image.imageUrl.trim() && image.label.trim())

  function handlePrimaryAction() {
    if (mode === 'edit') {
      handleSubmit()
    } else {
      goNext()
    }
  }

  const primaryDisabled = ((mode === 'edit' || isLast) && !isFormValid) || submitting
  const primaryLabel = t(submitting
    ? 'Saving…'
    : mode === 'edit'
      ? 'Save'
      : isLast ? 'Create' : 'Next')

  const previewProps = {
    view: previewView,
    onViewChange: setPreviewView,
    name: form.name,
    tagline: form.tagline,
    imageUrl: form.imageUrl,
    description: form.desc,
    genres: form.genres,
    introTurns: form.introTurns,
    examples: form.prompt.examples,
    situationImages: form.situationImages,
    suggestions: form.suggestions,
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">

      <PageNavBar
        title={t(mode === 'edit' ? 'Edit character' : 'Create character')}
        titleClassName="text-base font-semibold text-foreground"
        onBack={() => router.back()}
        trailing={
          <button type="button" onClick={() => setMobilePreviewOpen(true)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted lg:hidden">
            <Eye className="h-4 w-4" aria-hidden />{t('Preview')}
          </button>
        }
      />

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="scroll-hide mx-auto w-full max-w-[680px] shrink-0 overflow-x-auto px-4 pt-3">
        <UnderlineTabs
          value={activeTab}
          onValueChange={selectTab}
          options={TABS.map((tab) => ({ value: tab.id, label: `${t(tab.label)}${tab.required ? ' *' : ''}` }))}
          listClassName="min-w-max justify-start gap-6 sm:justify-center [&>button]:text-[15px]"
        />
      </div>

      {/* 탭 콘텐츠 */}
      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto w-full max-w-[648px]">
          <div className="mb-6 space-y-1 border-b border-border pb-5">
            <h2 className="text-[19px] font-bold text-foreground">{t(TAB_INTROS[activeTab].title)}</h2>
            <p className={characterFormDescriptionClassName}>{t(TAB_INTROS[activeTab].description)}</p>
          </div>
          {activeTab === 'settings' && <SettingsTab form={form} setForm={setForm} onFileChange={setImageFile} />}
          {activeTab === 'intro'    && <IntroTab    form={form} setForm={setForm} />}
          {activeTab === 'prompt'   && <PromptTab   form={form} setForm={setForm} />}
          {activeTab === 'examples' && <ExamplesTab form={form} setForm={setForm} />}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="px-4 pb-2 text-center text-sm text-destructive">{error}</p>
      )}

      {/* 하단 버튼 */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto grid w-full max-w-[648px] grid-cols-2 gap-3">
          {currentIdx > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={goPrevious}
              className="w-full min-w-0 rounded-xl text-base font-semibold"
            >
              {t('Previous')}
            </Button>
          ) : (
            <div aria-hidden="true" />
          )}
          <Button
            type="button"
            size="lg"
            disabled={primaryDisabled}
            onClick={handlePrimaryAction}
            className="w-full min-w-0 rounded-xl text-base font-semibold"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
        </div>
        <aside className="hidden min-h-0 w-[320px] shrink-0 border-l border-border lg:flex xl:w-[380px]" aria-label={t('Preview')}>
          <CharacterCreatePreview {...previewProps} />
        </aside>
      </div>
      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        {mobilePreviewOpen ? (
          <BottomSheetContent open={mobilePreviewOpen} onDismiss={() => setMobilePreviewOpen(false)} className="h-[85dvh] lg:hidden">
            <DialogTitle className="sr-only">{t('Preview')}</DialogTitle>
            <CharacterCreatePreview {...previewProps} onClose={() => setMobilePreviewOpen(false)} />
          </BottomSheetContent>
        ) : null}
      </Dialog>
    </div>
  )
}
