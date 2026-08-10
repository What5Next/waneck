"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Gem,
  Loader2,
  Lock,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { LoginModal } from "@/components/auth/login-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTextOption,
  PopoverMenuTrigger,
} from "@/components/ui/popover-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCharacterComment } from "@/hooks/mutations/use-create-character-comment";
import { useDeleteCharacterComment } from "@/hooks/mutations/use-delete-character-comment";
import { useUpdateCharacterComment } from "@/hooks/mutations/use-update-character-comment";
import { useCharacterCommentsQuery } from "@/hooks/queries/use-character-comments-query";
import {
  countCommentsInTree,
  sortTopLevelComments,
} from "@/lib/character-comments-tree";
import { getProfileInitials, getProfileName } from "@/lib/user-profile";
import type { CharacterComment } from "@/lib/types";
import { cn } from "@/lib/utils";

const TOP_LEVEL_COMMENT_MAX = 3000;

type CharacterCommentsPanelProps = {
  characterId: string;
  enabled?: boolean;
};

type CommentSort = "popular" | "newest" | "oldest";

const SORT_LABELS: Record<CommentSort, string> = {
  popular: "Popular",
  newest: "Newest",
  oldest: "Oldest",
};

function getAuthorName(comment: CharacterComment): string {
  return comment.author.display_name?.trim() || "Anonymous";
}

function CommentComposer({
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
  isBusy,
  isEditing,
  showComposer,
  placeholder = "Leave a comment...",
  compact = false,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isBusy: boolean;
  isEditing: boolean;
  showComposer: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  if (!showComposer) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-muted/25",
        compact && "rounded-xl",
      )}
    >
      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={placeholder}
        maxLength={1000}
        rows={compact ? 2 : 3}
        className="w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />

      <div className="flex items-center justify-between gap-3 border-t border-border/50 px-3 py-2.5">
        {!compact ? (
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
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {isEditing && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          ) : onCancel ? (
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
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              draft.trim() && !isBusy
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground opacity-50",
            )}
            aria-label={isEditing ? "Update comment" : "Send comment"}
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
  );
}

function TopLevelComposer({
  authorName,
  draft,
  onDraftChange,
  onSubmit,
  isBusy,
}: {
  authorName: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  isBusy: boolean;
}) {
  const isSubmitEnabled = draft.trim().length > 0 && !isBusy;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {getProfileInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-semibold text-foreground">
          {authorName}
        </span>
      </div>

      <div className="rounded-2xl bg-muted/40 px-4 pb-2 pt-2.5">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Leave a comment..."
          maxLength={TOP_LEVEL_COMMENT_MAX}
          rows={2}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="flex justify-end pb-0.5">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isSubmitEnabled}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors",
              isSubmitEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground opacity-60",
            )}
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentListItem({
  comment,
  isOwn,
  isEditing,
  editDraft,
  onEditDraftChange,
  onEditSubmit,
  onEditCancel,
  onEdit,
  onDelete,
  isDeleting,
  isBusy,
}: {
  comment: CharacterComment;
  isOwn: boolean;
  isEditing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  isBusy: boolean;
}) {
  const authorName = getAuthorName(comment);

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
            <span className="truncate text-sm font-semibold text-foreground">
              {authorName}
            </span>
          </div>

          {isOwn && !isEditing ? (
            <PopoverMenu>
              <PopoverMenuTrigger
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Comment options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </PopoverMenuTrigger>
              <PopoverMenuContent align="end" side="bottom" width="auto">
                <PopoverMenuItem
                  label="Edit"
                  className="whitespace-nowrap px-2.5 py-2"
                  onClick={onEdit}
                />
                <PopoverMenuItem
                  label="Delete"
                  className="whitespace-nowrap px-2.5 py-2 text-destructive focus:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                />
              </PopoverMenuContent>
            </PopoverMenu>
          ) : (
            <span className="h-7 w-7 shrink-0" aria-hidden />
          )}
        </div>

        {isEditing ? (
          <CommentComposer
            draft={editDraft}
            onDraftChange={onEditDraftChange}
            onSubmit={onEditSubmit}
            onCancel={onEditCancel}
            isBusy={isBusy}
            isEditing
            showComposer
            compact
            placeholder="Edit comment..."
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {comment.content}
          </p>
        )}
      </div>
    </article>
  );
}

function CommentThread({
  comment,
  userId,
  editingCommentId,
  editDraft,
  onEditDraftChange,
  onEditSubmit,
  onEditCancel,
  onStartEdit,
  onDelete,
  isDeletingId,
  isBusy,
}: {
  comment: CharacterComment;
  userId?: string;
  editingCommentId: string | null;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onEditSubmit: (commentId: string) => void;
  onEditCancel: () => void;
  onStartEdit: (comment: CharacterComment) => void;
  onDelete: (commentId: string) => void;
  isDeletingId: string | null;
  isBusy: boolean;
}) {
  const isEditingTop = editingCommentId === comment.id;

  return (
    <CommentListItem
      comment={comment}
      isOwn={Boolean(userId && comment.author.id === userId)}
      isEditing={isEditingTop}
      editDraft={editDraft}
      onEditDraftChange={onEditDraftChange}
      onEditSubmit={() => onEditSubmit(comment.id)}
      onEditCancel={onEditCancel}
      onEdit={() => onStartEdit(comment)}
      onDelete={() => onDelete(comment.id)}
      isDeleting={isDeletingId === comment.id}
      isBusy={isBusy}
    />
  );
}

export function CharacterCommentsPanel({
  characterId,
  enabled = true,
}: CharacterCommentsPanelProps) {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [draft, setDraft] = useState("");
  const [sort, setSort] = useState<CommentSort>("popular");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const { data: comments = [], isPending: isLoadingComments } =
    useCharacterCommentsQuery(characterId, { enabled });

  const createComment = useCreateCharacterComment(characterId);
  const updateComment = useUpdateCharacterComment(characterId);
  const deleteComment = useDeleteCharacterComment(characterId);

  const isBusy =
    createComment.isPending ||
    updateComment.isPending ||
    deleteComment.isPending;

  const displayComments = useMemo(
    () => sortTopLevelComments(comments, sort),
    [comments, sort],
  );
  const totalCommentCount = useMemo(
    () => countCommentsInTree(comments),
    [comments],
  );
  const composerAuthorName = user ? getProfileName(user, null) : "You";

  function requireAuth(action: () => void) {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    action();
  }

  async function handleSubmitTopLevel() {
    const trimmed = draft.trim();
    if (!trimmed || isBusy) return;

    requireAuth(async () => {
      try {
        await createComment.mutateAsync({ content: trimmed });
        setDraft("");
      } catch {
        toast.error("Failed to save comment.");
      }
    });
  }

  function handleStartEdit(comment: CharacterComment) {
    setEditingCommentId(comment.id);
    setEditDraft(comment.content);
  }

  async function handleEditSubmit(commentId: string) {
    const trimmed = editDraft.trim();
    if (!trimmed || isBusy) return;

    requireAuth(async () => {
      try {
        await updateComment.mutateAsync({ commentId, content: trimmed });
        setEditingCommentId(null);
        setEditDraft("");
      } catch {
        toast.error("Failed to update comment.");
      }
    });
  }

  async function handleDelete(commentId: string) {
    if (isBusy) return;

    requireAuth(async () => {
      setDeletingCommentId(commentId);
      try {
        await deleteComment.mutateAsync(commentId);
        if (editingCommentId === commentId) {
          setEditingCommentId(null);
          setEditDraft("");
        }
      } catch {
        toast.error("Failed to delete comment.");
      } finally {
        setDeletingCommentId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        redirectPath={`/characters/${characterId}`}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Comments {totalCommentCount}
        </h2>

        <PopoverMenu open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
          <PopoverMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            {SORT_LABELS[sort]}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                sortMenuOpen && "rotate-180",
              )}
              aria-hidden
            />
          </PopoverMenuTrigger>

          <PopoverMenuContent side="bottom" align="end" width="sm">
            {(Object.keys(SORT_LABELS) as CommentSort[]).map((option) => (
              <PopoverMenuTextOption
                key={option}
                selected={sort === option}
                onClick={() => {
                  setSort(option);
                  setSortMenuOpen(false);
                }}
              >
                {SORT_LABELS[option]}
              </PopoverMenuTextOption>
            ))}
          </PopoverMenuContent>
        </PopoverMenu>
      </div>

      <TopLevelComposer
        authorName={composerAuthorName}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={handleSubmitTopLevel}
        isBusy={isBusy}
      />

      {isLoadingComments ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      ) : displayComments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No comments yet.
        </p>
      ) : (
        <div>
          {displayComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              userId={user?.id}
              editingCommentId={editingCommentId}
              editDraft={editDraft}
              onEditDraftChange={setEditDraft}
              onEditSubmit={handleEditSubmit}
              onEditCancel={() => {
                setEditingCommentId(null);
                setEditDraft("");
              }}
              onStartEdit={handleStartEdit}
              onDelete={handleDelete}
              isDeletingId={deletingCommentId}
              isBusy={isBusy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
