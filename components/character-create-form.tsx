'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Eye, Plus, Upload, User, X } from 'lucide-react'
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
import { buildCharacterPrompt, EMPTY_CHARACTER_PROMPT, parseCharacterPrompt, type CharacterPromptFields } from '@/lib/character-prompt'
import { useDevLanguage } from '@/components/dev-language-provider'
import { characterCreateText } from '@/lib/character-create-copy'

function useFormText() {
  const { language } = useDevLanguage()
  return (english: string) => characterCreateText(language, english)
}

// ─── 탭 정의 ───────────────────────────────────────────────────────────────

type TabId = 'settings' | 'intro' | 'prompt' | 'examples' | 'detail'

const TABS: { id: TabId; label: string; required?: boolean }[] = [
  { id: 'settings', label: 'Character', required: true },
  { id: 'prompt', label: 'Persona', required: true },
  { id: 'intro', label: 'Opening', required: true },
  { id: 'examples', label: 'Examples' },
  { id: 'detail', label: 'Details' },
]

const TAB_ORDER: TabId[] = TABS.map((t) => t.id)

const TAB_INTROS: Record<TabId, { title: string; description: string }> = {
  settings: { title: 'Character', description: 'Set the name and image people will see.' },
  prompt: { title: 'Persona', description: 'Define how this character thinks, speaks, and reacts in every chat.' },
  intro: { title: 'Opening', description: 'Write the scene shown when a new chat begins.' },
  examples: { title: 'Examples', description: 'Show the model how this character replies in different situations.' },
  detail: { title: 'Details', description: 'Choose discovery details and suggested replies.' },
}

// ─── 폼 상태 ───────────────────────────────────────────────────────────────

type IntroTurn = { role: 'user' | 'model'; text: string }

type FormState = {
  imageUrl: string
  emoji: string
  name: string
  tagline: string
  introTurns: IntroTurn[]
  prompt: CharacterPromptFields
  tag: string
  genres: string[]
  mood: string
  desc: string
  suggestions: string[]
}

const DEFAULT_FORM: FormState = {
  imageUrl: '',
  emoji: '',
  name: '',
  tagline: '',
  introTurns: [
    { role: 'model', text: '' },
  ],
  prompt: EMPTY_CHARACTER_PROMPT,
  tag: '',
  genres: [],
  mood: '',
  desc: '',
  suggestions: ['', '', ''],
}

function toFormState(character: CharacterWithDetail): FormState {
  const suggestions = Array.isArray(character.suggestions)
    ? character.suggestions.filter((s): s is string => typeof s === 'string')
    : []

  return {
    imageUrl: character.profile_image_url ?? '',
    emoji: '',
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
    tag: character.tag ?? '',
    genres: character.genres ?? [],
    mood: character.mood ?? '',
    desc: character.description ?? '',
    suggestions: [suggestions[0] ?? '', suggestions[1] ?? '', suggestions[2] ?? ''],
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

  return (
    <div className="flex flex-col gap-5">
      {/* 캐릭터 이미지 */}
      <Field label={t('Character image')}>
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
                  onClick={() => { onFileChange(null); setForm((f) => ({ ...f, imageUrl: '' })) }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label={t('Remove image')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : form.emoji ? (
              <div className="flex h-full w-full items-center justify-center text-4xl">
                {form.emoji}
              </div>
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
              onClick={() => {
                const emojis = ['🌸', '⚔️', '🧪', '🦊', '🐉', '🌙', '🔮', '🎭', '🦋', '🌊']
                const emoji = emojis[Math.floor(Math.random() * emojis.length)]
                setForm((f) => ({ ...f, emoji, imageUrl: '' }))
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('Random emoji')}
            </Button>
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
          placeholder={t('Enter a name')}
          maxLength={30}
        />
      </Field>

      {/* 한 줄 소개 */}
      <Field
        label={t('Tagline')}
        hint={t('Introduce your character in one sentence')}
      >
        <TextInput
          value={form.tagline}
          onChange={(v) => setForm((f) => ({ ...f, tagline: v }))}
          placeholder={t("e.g. I'm here to hear your story")}
          maxLength={50}
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
  function update(key: keyof CharacterPromptFields, value: string) {
    setForm((current) => ({ ...current, prompt: { ...current.prompt, [key]: value } }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Field
        label={t('Who are they?')}
        required
        hint={t('Role, age or life stage, goal, and what makes them different from other characters.')}
      >
        <TextArea
          value={form.prompt.identity}
          onChange={(v) => update('identity', v)}
          placeholder={t('e.g. A forensic archivist who cares more about the truth than being liked. Collects discarded voice recordings.')}
          rows={4}
          maxLength={1200}
        />
      </Field>
      <Field label={t('Personality and inner conflict')} required hint={t('Show traits through choices. Include a flaw, desire, fear, and a contradiction.')}>
        <TextArea value={form.prompt.personality} onChange={(v) => update('personality', v)}
          placeholder={t('e.g. Precise and guarded with strangers; quietly generous with people who notice details. Wants trust but tests it by withholding facts. Admits mistakes only after trying to fix them.')}
          rows={5} maxLength={1800} />
      </Field>
      <Field label={t('Backstory and world')} hint={t('Only include history or setting details that should shape replies.')}>
        <TextArea value={form.prompt.backstory} onChange={(v) => update('backstory', v)}
          placeholder={t('What happened before this chat? Which people, places, or rules matter now?')}
          rows={4} maxLength={1600} />
      </Field>
      <Field label={t('Relationship with the user')} hint={t('Define what they know about the user, what they want from them, and how trust changes.')}>
        <TextArea value={form.prompt.relationship} onChange={(v) => update('relationship', v)}
          placeholder={t('e.g. The user is a new colleague, not an old friend. At first they share practical facts only; trust grows when the user keeps a confidence.')}
          rows={4} maxLength={1400} />
      </Field>
      <Field label={t('Current situation')} hint={t('Where does the conversation begin? What is happening right now?')}>
        <TextArea value={form.prompt.scenario} onChange={(v) => update('scenario', v)}
          placeholder={t('e.g. The archive closes in ten minutes. A recording has vanished, and the user is the last person who checked it out.')}
          rows={4} maxLength={1400} />
      </Field>
      <Field label={t('Voice and dialogue style')} required hint={t('Specify rhythm, vocabulary, humor, formality, and how emotion changes their speech.')}>
        <TextArea value={form.prompt.voice} onChange={(v) => update('voice', v)}
          placeholder={t('e.g. Short, exact sentences; no pet names or emojis. Deflects concern with dry observations. When afraid, asks one unusually direct question.')}
          rows={4} maxLength={1400} />
      </Field>
      <div className="space-y-4 border-t border-border/60 pt-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t('Story direction')}</h3>
          <p className={characterFormDescriptionClassName}>{t('Set the viewpoint, pace, and usual reply length. The model can still adapt to the scene.')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t('Viewpoint')}>
            <InputDropdown value={form.prompt.viewpoint}
              onValueChange={(value) => setForm((current) => ({ ...current, prompt: { ...current.prompt, viewpoint: value } }))}
              options={[{ value: 'automatic', label: t('Automatic') }, { value: 'first', label: t('First person') }, { value: 'second', label: t('Second person') }, { value: 'third', label: t('Third person') }]}
              triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Viewpoint')} />
          </Field>
          <Field label={t('Pace')}>
            <InputDropdown value={form.prompt.pacing}
              onValueChange={(value) => setForm((current) => ({ ...current, prompt: { ...current.prompt, pacing: value } }))}
              options={[{ value: 'natural', label: t('Natural') }, { value: 'slow', label: t('Slow') }, { value: 'fast', label: t('Fast') }]}
              triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Pace')} />
          </Field>
          <Field label={t('Reply length')}>
            <InputDropdown value={form.prompt.replyLength}
              onValueChange={(value) => setForm((current) => ({ ...current, prompt: { ...current.prompt, replyLength: value } }))}
              options={[{ value: 'adaptive', label: t('Adaptive') }, { value: 'short', label: t('Short') }, { value: 'medium', label: t('Medium') }, { value: 'long', label: t('Long') }]}
              triggerClassName={`${characterFormInputClassName} [&>span]:text-base`} aria-label={t('Reply length')} />
          </Field>
        </div>
      </div>
      <Field label={t('Reactions and boundaries')} hint={t("Describe how this person responds to disagreement, affection, danger, or secrets. Avoid generic 'always kind' rules.")}>
        <TextArea value={form.prompt.reactions} onChange={(v) => update('reactions', v)}
          placeholder={t("e.g. If challenged, asks for evidence instead of apologizing at once. If the user withdraws, gives them space. Never decides the user's feelings or actions for them.")}
          rows={4} maxLength={1400} />
      </Field>
      <Field label={t('Extra instructions')} hint={t("Optional advanced rules. Existing characters' old prompts appear here and remain intact.")}>
        <TextArea value={form.prompt.additional} onChange={(v) => update('additional', v)}
          placeholder={t('Other details that must stay true across conversations')}
          rows={4} maxLength={2500} />
      </Field>
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

  return (
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
  )
}

// ─── 탭 4: 고급 기능 ──────────────────────────────────────────────────────

function AdvancedTab({
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

  return (
    <div className="flex flex-col gap-6">
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

      {/* 현재 상태 */}
      <Field
        label={t('Status')}
        hint={t('Short status shown on character lists')}
      >
        <TextInput
          value={form.mood}
          onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
          placeholder={t('e.g. Waiting warmly')}
          maxLength={20}
        />
      </Field>
    </div>
  )
}

// ─── 탭 5: 캐릭터 상세 ────────────────────────────────────────────────────

function DetailTab({
  form,
  setForm,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const t = useFormText()
  const TAGS = ['Emotional', 'Direct', 'Knowledge', 'Humor', 'Fantasy', 'Romance', 'Thriller', 'Slice of life']

  function toggleGenre(genre: string) {
    setForm((current) => ({
      ...current,
      genres: current.genres.includes(genre)
        ? current.genres.filter((item) => item !== genre)
        : [...current.genres, genre],
    }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 장르 (복수 선택) */}
      <Field label={t('Genres')} hint={t('Pick categories that fit your character')}>
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

      {/* 태그 */}
      <Field label={t('Tag')} hint={t('Pick the tag that best fits your character')}>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              selected={form.tag === tag}
              onClick={() => setForm((f) => ({ ...f, tag: f.tag === tag ? '' : tag }))}
            >
              {t(tag)}
            </Chip>
          ))}
        </div>
      </Field>

      {/* 상세 소개 */}
      <Field
        label={t('Full description')}
        hint={t('Shown on the character detail page')}
      >
        <TextArea
          value={form.desc}
          onChange={(v) => setForm((f) => ({ ...f, desc: v }))}
          placeholder={t('Describe your character in detail')}
          rows={5}
          maxLength={300}
        />
      </Field>
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

      const payload = {
        name: form.name,
        short_intro: form.tagline,
        system_prompt: buildCharacterPrompt(form.name, form.prompt),
        tag: form.tag,
        genres: form.genres,
        mood: form.mood,
        description: form.desc,
        suggestions: form.suggestions.filter(Boolean),
        introTurns: form.introTurns,
        ...(profileImageUrl !== undefined
          ? { profile_image_url: profileImageUrl }
          : {}),
      }

      if (mode === 'edit' && characterId) {
        const updated = await updateCharacterMutation.mutateAsync(payload)
        setImageFile(null)
        setForm((f) => ({ ...f, imageUrl: updated.profile_image_url ?? '' }))
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
    setPreviewView(tab === 'intro' || tab === 'prompt' ? 'chat' : tab === 'examples' ? 'examples' : 'profile')
  }

  function goNext() {
    if (isLast) {
      handleSubmit()
    } else {
      selectTab(TAB_ORDER[currentIdx + 1])
    }
  }

  // edit 모드에서는 특정 탭만 수정하고 바로 저장할 수 있어야 하므로
  // 전체 폼 기준으로 필수값을 검증한다 (현재 탭 기준이 아님).
  const personaComplete =
    form.prompt.identity.trim().length > 0 &&
    form.prompt.personality.trim().length > 0 &&
    form.prompt.voice.trim().length > 0
  const examplesComplete = form.prompt.examples.every((example) =>
    Boolean(example.user.trim()) === Boolean(example.character.trim()),
  )
  const isFormValid =
    form.name.trim().length > 0 &&
    (personaComplete || (mode === 'edit' && form.prompt.additional.trim().length > 0)) &&
    form.introTurns.every((t) => t.text.trim().length > 0) &&
    examplesComplete

  // 탭을 직접 눌러 앞 단계를 건너뛰어도, 현재 단계까지의 필수 항목은 모두 확인한다.
  const canNext =
    form.name.trim().length > 0 &&
    (currentIdx < TAB_ORDER.indexOf('prompt') || personaComplete) &&
    (currentIdx < TAB_ORDER.indexOf('intro') || form.introTurns.every((turn) => turn.text.trim().length > 0)) &&
    (currentIdx < TAB_ORDER.indexOf('examples') || examplesComplete)

  function handlePrimaryAction() {
    if (mode === 'edit') {
      handleSubmit()
    } else {
      goNext()
    }
  }

  const primaryDisabled = (mode === 'edit' || isLast ? !isFormValid : !canNext) || submitting
  const primaryLabel = t(submitting
    ? 'Saving…'
    : mode === 'edit'
      ? 'Save'
      : isLast ? 'Done' : 'Next')

  const previewProps = {
    view: previewView,
    onViewChange: setPreviewView,
    name: form.name,
    tagline: form.tagline,
    imageUrl: form.imageUrl,
    emoji: form.emoji,
    description: form.desc,
    mood: form.mood,
    genres: form.genres,
    introTurns: form.introTurns,
    examples: form.prompt.examples,
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
          {activeTab === 'detail'   && <div className="flex flex-col gap-6"><DetailTab form={form} setForm={setForm} /><AdvancedTab form={form} setForm={setForm} /></div>}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="px-4 pb-2 text-center text-sm text-destructive">{error}</p>
      )}

      {/* 하단 버튼 */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto flex w-full max-w-[648px]">
          <Button
            type="button"
            size="lg"
            disabled={primaryDisabled}
            onClick={handlePrimaryAction}
            className="w-full rounded-xl text-base font-semibold"
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
