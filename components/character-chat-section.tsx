'use client'

import Link from 'next/link'
import { MessageCircle, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { LoginModal } from '@/components/auth/login-modal'
import { useAuth } from '@/hooks/use-auth'
import { useStartChat } from '@/hooks/mutations/use-start-chat'
import { useDeleteConversation } from '@/hooks/mutations/use-delete-conversation'
import { useCharacterConversationsQuery } from '@/hooks/queries/use-character-conversations-query'
import { useState } from 'react'

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type Props = {
  characterId: string
}

export function CharacterChatSection({ characterId }: Props) {
  const { isAuthenticated } = useAuth()
  const startChatMutation = useStartChat()
  const deleteMutation = useDeleteConversation(characterId)
  const { data: conversations } = useCharacterConversationsQuery(
    characterId,
    isAuthenticated,
  )
  const [showLogin, setShowLogin] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleNewChat() {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    await startChatMutation.mutateAsync(characterId)
  }

  const hasPrevious = (conversations?.length ?? 0) > 0

  return (
    <>
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={`/characters/${characterId}?autostart=true`}
      />

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}
      >
        <DialogContent variant="center" showClose={false}>
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription>
              This conversation and all its messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (pendingDeleteId) {
                  deleteMutation.mutate(pendingDeleteId, {
                    onSuccess: () => setPendingDeleteId(null),
                  })
                }
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {hasPrevious ? (
        <div className="flex flex-col gap-3">
          {/* 기존 대화 목록 */}
          <p className="text-xs font-medium text-muted-foreground">Previous chats</p>
          <ul className="flex flex-col gap-1.5">
            {conversations!.map((conv, i) => (
              <li key={conv.id} className="flex items-center gap-2">
                <Link
                  href={`/chat/${characterId}/${conv.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {conv.title ?? `Chat ${i + 1}`}
                  </span>
                  {conv.last_message_at ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(conv.last_message_at)}
                    </span>
                  ) : null}
                </Link>
                <button
                  type="button"
                  aria-label="Delete chat"
                  onClick={() => setPendingDeleteId(conv.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {/* 새 대화 */}
          <Button
            variant="outline"
            onClick={handleNewChat}
            disabled={startChatMutation.isPending}
            className="h-11 w-full rounded-xl text-sm font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {startChatMutation.isPending ? 'Starting…' : 'New chat'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleNewChat}
          disabled={startChatMutation.isPending}
          className="h-11 w-full rounded-xl text-sm font-semibold"
        >
          {startChatMutation.isPending ? 'Opening chat…' : 'Start chat'}
        </Button>
      )}
    </>
  )
}
