'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Gem,
  Heart,
  Loader2,
  Lock,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

import { LoginModal } from '@/components/auth/login-modal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTrigger,
} from '@/components/ui/popover-menu'
import { useAuth } from '@/hooks/use-auth'
import { useCreateCharacterComment } from '@/hooks/mutations/use-create-character-comment'
import { useDeleteCharacterComment } from '@/hooks/mutations/use-delete-character-comment'
import { useUpdateCharacterComment } from '@/hooks/mutations/use-update-character-comment'
import { useCharacterCommentsQuery } from '@/hooks/queries/use-character-comments-query'
import { formatRelativeCommentTime } from '@/lib/character-detail'
import { ApiError } from '@/lib/api/client'
import { getProfileInitials } from '@/lib/user-profile'
import type { CharacterComment } from '@/lib/types'
import { cn } from '@/lib/utils'

type CharacterCommentsPanelProps = {
  characterId: string
  myComment?: CharacterComment | null
  enabled?: boolean
}

type CommentSort = 'newest' | 'oldest'

function getAuthorName(comment: CharacterComment): string {
  return comment.author.display_name?.trim() || 'Anonymous'
}

function sortComments(comments: CharacterComment[], sort: CommentSort): CharacterComment[] {
  const sorted = [...comments]
  sorted.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return sort === 'newest' ? bTime - aTime : aTime - bTime
  })
  return sorted
}

function CommentComposer({
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
  isBusy,
  isEditing,
  showComposer,
}: {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  onCancel?: () => void
  isBusy: boolean
  isEditing: boolean
  showComposer: boolean
}) {
  if (!showComposer) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/25">
      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="Leave a comment..."
        maxLength={1000}
        rows={3}
        className="w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            onSubmit()
          }
        }}
      />

      <div className="flex items-center justify-between gap-3 border-t border-border/50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-60"
          >
            <Lock className="h-3 w-3" />
            Public
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-60"
          >
            <Gem className="h-3 w-3 text-violet-400" />
            Gift
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!draft.trim() || isBusy}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              draft.trim() && !isBusy
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground opacity-50',
            )}
            aria-label={isEditing ? 'Update comment' : 'Send comment'}
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function CommentListItem({
  comment,
  isOwn,
  onEdit,
  onDelete,
  isDeleting,
}: {
  comment: CharacterComment
  isOwn: boolean
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}) {
  const authorName = getAuthorName(comment)

  return (
    <article className="flex gap-3 border-b border-border/40 py-4 last:border-b-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
          {getProfileInitials(authorName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{authorName}</span>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeCommentTime(comment.created_at)}
            </time>
          </div>

          {isOwn ? (
            <PopoverMenu>
              <PopoverMenuTrigger
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Comment options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </PopoverMenuTrigger>
              <PopoverMenuContent align="end" side="bottom" width="sm">
                <PopoverMenuItem label="Edit" onClick={onEdit} />
                <PopoverMenuItem
                  label="Delete"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                />
              </PopoverMenuContent>
            </PopoverMenu>
          ) : (
            <span className="h-7 w-7 shrink-0" aria-hidden />
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {comment.content}
        </p>

        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex items-center gap-1 opacity-50"
          >
            <Heart className="h-3.5 w-3.5" />
            <span>0</span>
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="font-medium opacity-50"
          >
            Reply
          </button>
        </div>
      </div>
    </article>
  )
}

export function CharacterCommentsPanel({
  characterId,
  myComment,
  enabled = true,
}: CharacterCommentsPanelProps) {
  const { isAuthenticated, user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [draft, setDraft] = useState(myComment?.content ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [sort, setSort] = useState<CommentSort>('newest')

  const { data: comments = [], isPending: isLoadingComments } =
    useCharacterCommentsQuery(characterId, { enabled })

  const createComment = useCreateCharacterComment(characterId)
  const updateComment = useUpdateCharacterComment(characterId)
  const deleteComment = useDeleteCharacterComment(characterId)

  const isBusy =
    createComment.isPending || updateComment.isPending || deleteComment.isPending

  const showComposer = !myComment || isEditing

  const displayComments = useMemo(() => {
    const merged = [...comments]
    if (myComment && !merged.some((comment) => comment.id === myComment.id)) {
      merged.push(myComment)
    }
    return sortComments(merged, sort)
  }, [comments, myComment, sort])

  useEffect(() => {
    if (!isEditing) {
      setDraft(myComment?.content ?? '')
    }
  }, [myComment?.content, isEditing])

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    action()
  }

  async function handleSubmit() {
    const trimmed = draft.trim()
    if (!trimmed || isBusy) return

    requireAuth(async () => {
      try {
        if (myComment) {
          await updateComment.mutateAsync(trimmed)
          setIsEditing(false)
        } else {
          await createComment.mutateAsync(trimmed)
          setDraft('')
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          setIsEditing(true)
          toast.message('이미 댓글이 있습니다. 수정해 주세요.')
          return
        }
        toast.error('댓글 저장에 실패했습니다.')
      }
    })
  }

  async function handleDelete() {
    if (!myComment || isBusy) return

    requireAuth(async () => {
      try {
        await deleteComment.mutateAsync()
        setDraft('')
        setIsEditing(false)
      } catch {
        toast.error('댓글 삭제에 실패했습니다.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={`/characters/${characterId}`}
      />

      <CommentComposer
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsEditing(false)
          setDraft(myComment?.content ?? '')
        }}
        isBusy={isBusy}
        isEditing={isEditing}
        showComposer={showComposer}
      />

      <div className="flex items-center justify-end gap-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setSort('newest')}
          className={cn(
            'transition-colors',
            sort === 'newest' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Newest
        </button>
        <button
          type="button"
          onClick={() => setSort('oldest')}
          className={cn(
            'transition-colors',
            sort === 'oldest' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Oldest
        </button>
      </div>

      {isLoadingComments ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      ) : displayComments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          아직 댓글이 없습니다.
        </p>
      ) : (
        <div>
          {displayComments.map((comment) => (
            <CommentListItem
              key={comment.id}
              comment={comment}
              isOwn={Boolean(user?.id && comment.author.id === user.id)}
              onEdit={() => {
                setIsEditing(true)
                setDraft(comment.content)
              }}
              onDelete={handleDelete}
              isDeleting={deleteComment.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
