'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { ChevronLeft, Plus, Upload, User, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, TextInput, TextArea } from '@/components/ui/form-field'

// ─── 탭 정의 ───────────────────────────────────────────────────────────────

type TabId = 'settings' | 'intro' | 'prompt' | 'advanced' | 'detail'

const TABS: { id: TabId; label: string; required?: boolean }[] = [
  { id: 'settings', label: '캐릭터 설정', required: true },
  { id: 'intro',    label: '인트로',     required: true },
  { id: 'prompt',   label: '프롬프트',   required: true },
  { id: 'advanced', label: '고급 기능' },
  { id: 'detail',   label: '캐릭터 상세' },
]

const TAB_ORDER: TabId[] = TABS.map((t) => t.id)

// ─── 폼 상태 ───────────────────────────────────────────────────────────────

type IntroTurn = { role: 'user' | 'model'; text: string }

type FormState = {
  imageUrl: string
  emoji: string
  name: string
  tagline: string
  introTurns: IntroTurn[]
  system: string
  tag: string
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
    { role: 'user',  text: '' },
    { role: 'model', text: '' },
  ],
  system: '',
  tag: '',
  mood: '',
  desc: '',
  suggestions: ['', '', ''],
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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onFileChange(file)
    const url = URL.createObjectURL(file)
    setForm((f) => ({ ...f, imageUrl: url }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 캐릭터 이미지 */}
      <Field label="캐릭터 이미지">
        <div className="flex flex-col items-center gap-3">
          {/* 이미지 프리뷰 */}
          <div className="relative h-[140px] w-[140px] overflow-hidden rounded-2xl border border-border bg-muted">
            {form.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="캐릭터 이미지"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { onFileChange(null); setForm((f) => ({ ...f, imageUrl: '' })) }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="이미지 제거"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : form.emoji ? (
              <div className="flex h-full w-full items-center justify-center text-6xl">
                {form.emoji}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-14 w-14 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* 버튼 2개 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-xs"
              onClick={() => {
                const emojis = ['🌸', '⚔️', '🧪', '🦊', '🐉', '🌙', '🔮', '🎭', '🦋', '🌊']
                const emoji = emojis[Math.floor(Math.random() * emojis.length)]
                setForm((f) => ({ ...f, emoji, imageUrl: '' }))
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              이미지 생성
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-xs"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              업로드
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
      <Field label="캐릭터 이름" required>
        <TextInput
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder="이름을 입력하세요"
          maxLength={30}
        />
      </Field>

      {/* 한 줄 소개 */}
      <Field
        label="한 줄 소개"
        hint="캐릭터를 한 문장으로 소개해 주세요"
      >
        <TextInput
          value={form.tagline}
          onChange={(v) => setForm((f) => ({ ...f, tagline: v }))}
          placeholder="예) 당신의 이야기를 들어드릴게요"
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
        { role: f.introTurns.length % 2 === 0 ? 'user' : 'model', text: '' },
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
    <div className="flex flex-col gap-6">
      <Field
        label="인트로 대화"
        required
        hint="채팅 시작 시 보여줄 예시 대화를 작성해 주세요"
      >
        <div className="flex flex-col gap-3">
          {form.introTurns.map((turn, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <select
                  value={turn.role}
                  onChange={(e) => updateTurn(idx, 'role', e.target.value)}
                  className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="user">사용자</option>
                  <option value="model">캐릭터</option>
                </select>
                {form.introTurns.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeTurn(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <TextArea
                value={turn.text}
                onChange={(v) => updateTurn(idx, 'text', v)}
                placeholder={turn.role === 'user' ? '사용자 메시지' : '캐릭터 응답'}
                rows={2}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 self-start rounded-xl text-xs"
            onClick={addTurn}
          >
            <Plus className="h-3.5 w-3.5" />
            대화 추가
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
  return (
    <div className="flex flex-col gap-6">
      <Field
        label="시스템 프롬프트"
        required
        hint="캐릭터의 성격, 말투, 역할을 AI에게 지시하는 문장을 작성해 주세요"
      >
        <TextArea
          value={form.system}
          onChange={(v) => setForm((f) => ({ ...f, system: v }))}
          placeholder={`예) 너의 이름은 하나야. 따뜻하고 감성적인 20대 여자 친구야. 항상 상대방의 감정에 공감하고, 부드럽고 다정한 반말로 대화해. AI라고 절대 밝히지 마.`}
          rows={8}
          maxLength={2000}
        />
      </Field>

      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <p className="mb-2 text-xs font-medium text-foreground">작성 팁</p>
        <ul className="flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground">
          <li>• 이름, 나이, 성격을 명확하게 서술하세요</li>
          <li>• 말투 (반말/존댓말, 이모지 사용 여부) 를 지정하세요</li>
          <li>• &quot;AI라고 절대 밝히지 마&quot; 로 몰입감을 높이세요</li>
          <li>• 특정 표현 패턴을 예시로 포함하면 좋아요</li>
        </ul>
      </div>
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
        label="추천 대화"
        hint="채팅 화면에서 사용자에게 제안할 대화 예시 (최대 3개)"
      >
        <div className="flex flex-col gap-2">
          {form.suggestions.map((s, idx) => (
            <TextInput
              key={idx}
              value={s}
              onChange={(v) => updateSuggestion(idx, v)}
              placeholder={`추천 대화 ${idx + 1}`}
              maxLength={40}
            />
          ))}
        </div>
      </Field>

      {/* 현재 상태 */}
      <Field
        label="현재 상태"
        hint="캐릭터 목록에 표시될 짧은 상태 메시지"
      >
        <TextInput
          value={form.mood}
          onChange={(v) => setForm((f) => ({ ...f, mood: v }))}
          placeholder="예) 따뜻하게 기다리는 중"
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
  const TAGS = ['감성', '직설', '지식', '유머', '판타지', '로맨스', '스릴러', '일상']

  return (
    <div className="flex flex-col gap-6">
      {/* 태그 */}
      <Field label="태그" hint="캐릭터를 가장 잘 표현하는 태그를 선택하세요">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setForm((f) => ({ ...f, tag: f.tag === tag ? '' : tag }))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                form.tag === tag
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </Field>

      {/* 상세 소개 */}
      <Field
        label="상세 소개"
        hint="캐릭터 상세 페이지에 표시될 소개글"
      >
        <TextArea
          value={form.desc}
          onChange={(v) => setForm((f) => ({ ...f, desc: v }))}
          placeholder="캐릭터에 대해 자세히 소개해 주세요"
          rows={5}
          maxLength={300}
        />
      </Field>
    </div>
  )
}

// ─── 메인 폼 ──────────────────────────────────────────────────────────────

export function CharacterCreateForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('settings')
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
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
      throw new Error(error ?? '이미지 업로드 실패')
    }
    const { publicUrl } = await res.json()
    return publicUrl
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      let profileImageUrl: string | null = null
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile)
      }

      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          short_intro: form.tagline,
          system_prompt: form.system,
          tag: form.tag,
          mood: form.mood,
          description: form.desc,
          suggestions: form.suggestions.filter(Boolean),
          introTurns: form.introTurns,
          profile_image_url: profileImageUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '저장에 실패했어요')
      router.push(`/characters/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했어요')
    } finally {
      setSubmitting(false)
    }
  }

  function goNext() {
    if (isLast) {
      handleSubmit()
    } else {
      setActiveTab(TAB_ORDER[currentIdx + 1])
    }
  }

  const canNext = (() => {
    if (activeTab === 'settings') return form.name.trim().length > 0
    if (activeTab === 'prompt')   return form.system.trim().length > 0
    if (activeTab === 'intro')    return form.introTurns.every((t) => t.text.trim().length > 0)
    return true
  })()

  return (
    <div className="flex w-full flex-col">

      {/* 헤더 */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-2 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">캐릭터 만들기</h1>
        <div className="h-10 w-10" />
      </header>

      {/* 탭 바 */}
      <nav
        className="flex shrink-0 gap-0 overflow-x-auto border-b border-border bg-background [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="단계"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-0.5 px-4 py-3 text-[13px] font-medium transition-colors',
              activeTab === tab.id
                ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.required && (
              <span className="text-destructive text-[10px]">*</span>
            )}
          </button>
        ))}
      </nav>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {activeTab === 'settings' && <SettingsTab form={form} setForm={setForm} onFileChange={setImageFile} />}
        {activeTab === 'intro'    && <IntroTab    form={form} setForm={setForm} />}
        {activeTab === 'prompt'   && <PromptTab   form={form} setForm={setForm} />}
        {activeTab === 'advanced' && <AdvancedTab form={form} setForm={setForm} />}
        {activeTab === 'detail'   && <DetailTab   form={form} setForm={setForm} />}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="px-4 pb-2 text-center text-sm text-destructive">{error}</p>
      )}

      {/* 하단 버튼 */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-4">
        <Button
          type="button"
          onClick={goNext}
          disabled={!canNext || submitting}
          className="w-full rounded-xl py-3 text-base font-semibold"
        >
          {submitting ? '저장 중...' : isLast ? '완료' : '다음'}
        </Button>
      </div>
    </div>
  )
}
