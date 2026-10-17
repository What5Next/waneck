'use client'

import { MessageSquare, User, X } from 'lucide-react'

import { MessageBubble } from '@/components/chat/message-bubble'
import { useDevLanguage } from '@/components/dev-language-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { characterCreateText } from '@/lib/character-create-copy'
import type { CharacterPromptFields } from '@/lib/character-prompt'
import { cn } from '@/lib/utils'

export type CharacterPreviewView = 'profile' | 'chat' | 'examples'

type PreviewProps = {
  view: CharacterPreviewView
  onViewChange: (view: CharacterPreviewView) => void
  onClose?: () => void
  name: string
  tagline: string
  imageUrl: string
  emoji: string
  description: string
  mood: string
  genres: string[]
  introTurns: { role: 'user' | 'model'; text: string }[]
  examples: CharacterPromptFields['examples']
  suggestions: string[]
  className?: string
}

export function CharacterCreatePreview({
  view,
  onViewChange,
  onClose,
  name,
  tagline,
  imageUrl,
  emoji,
  description,
  mood,
  genres,
  introTurns,
  examples,
  suggestions,
  className,
}: PreviewProps) {
  const { language } = useDevLanguage()
  const t = (english: string) => characterCreateText(language, english)
  const previewName = name.trim() || t('Character name')
  const previewCharacter = { name: previewName, profile_image_url: imageUrl || null }
  const visibleIntro = introTurns.filter((turn) => turn.text.trim())
  const visibleExamples = examples.filter((example) => example.user.trim() || example.character.trim())
  const visibleSuggestions = suggestions.filter((suggestion) => suggestion.trim())

  return (
    <section className={cn('flex h-full min-h-0 w-full flex-col bg-background', className)} aria-label={t('Preview')}>
      <div className="relative flex shrink-0 items-start px-5 pb-3 pt-5 text-left">
        <div className="min-w-0 pr-7">
          <h2 className="text-sm font-semibold text-foreground">{t('Preview')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('See how your draft will look in the app.')}</p>
        </div>
        {onClose ? (
          <IconButton onClick={onClose} aria-label={t('Close preview')} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </IconButton>
        ) : null}
      </div>
      <div className="shrink-0 px-5 pb-4">
        <SegmentedControl
          value={view}
          onValueChange={onViewChange}
          options={[
            { value: 'profile', label: t('Profile') },
            { value: 'chat', label: t('Opening chat') },
            { value: 'examples', label: t('Examples') },
          ]}
          shape="rounded"
          layout="equal"
          columns={3}
          className="w-full"
          aria-label={t('Preview sections')}
        />
      </div>
      <div className="scroll-hide min-h-0 flex-1 overflow-y-auto border-t border-border px-5 py-5">
        {view === 'profile' ? (
          <div className="mx-auto max-w-sm" data-dev-language-ignore>
            <div className="mx-auto flex h-48 w-36 items-center justify-center overflow-hidden rounded-xl bg-muted/35">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : emoji ? (
                <span className="text-5xl">{emoji}</span>
              ) : (
                <User className="h-12 w-12 text-muted-foreground/50" aria-hidden />
              )}
            </div>
            <h3 className={cn('mt-5 text-sm font-semibold leading-snug', name.trim() ? 'text-foreground' : 'text-muted-foreground')}>
              {previewName}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {tagline.trim() || t('Your one-line introduction appears here.')}
            </p>
            {mood.trim() ? <p className="mt-3 text-xs text-muted-foreground">{mood}</p> : null}
            {genres.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {genres.map((genre) => (
                  <span key={genre} className="rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground">{t(genre)}</span>
                ))}
              </div>
            ) : null}
            {description.trim() ? (
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground">{t('About')}</h4>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ) : null}
          </div>
        ) : view === 'chat' ? (
          <div className="flex flex-col gap-4" data-dev-language-ignore>
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Avatar className="h-9 w-9">
                {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
                <AvatarFallback className="bg-muted text-sm">{emoji || previewName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-semibold text-foreground">{previewName}</span>
            </div>
            {visibleIntro.length > 0 ? visibleIntro.map((turn, index) => (
              <MessageBubble
                key={index}
                role={turn.role}
                content={turn.text}
                character={previewCharacter}
                showAvatar={turn.role === 'model' && (index === 0 || visibleIntro[index - 1].role !== 'model')}
              />
            )) : (
              <EmptyState icon={MessageSquare} message={t('Write an opening message to see the chat preview.')} className="min-h-44" />
            )}
            {visibleSuggestions.length > 0 ? (
              <div className="flex flex-col items-end gap-2 pt-3">
                <span className="text-xs font-medium text-muted-foreground">{t('Suggested replies')}</span>
                {visibleSuggestions.map((suggestion, index) => (
                  <span key={index} className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/20 px-3 py-2 text-sm text-foreground">
                    {suggestion}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-5" data-dev-language-ignore>
            {visibleExamples.length > 0 ? visibleExamples.map((example, index) => (
              <div key={index} className="flex flex-col gap-3 border-b border-border pb-5 last:border-b-0">
                <span className="text-xs font-medium text-muted-foreground">{t('Example')} {index + 1}</span>
                {example.user.trim() ? <MessageBubble role="user" content={example.user} character={previewCharacter} /> : null}
                {example.character.trim() ? <MessageBubble role="model" content={example.character} character={previewCharacter} /> : null}
              </div>
            )) : (
              <EmptyState icon={MessageSquare} message={t('Add an example dialogue to see it here.')} className="min-h-44" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
