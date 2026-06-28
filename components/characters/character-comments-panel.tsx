"use client";

import { useMemo, useState } from "react";
import { Gem, Heart, Loader2, Lock, MoreHorizontal, Send } from "lucide-react";
import { toast } from "sonner";

import { LoginModal } from "@/components/auth/login-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PopoverMenu,
  PopoverMenuContent,
  PopoverMenuItem,
  PopoverMenuTrigger,
} from "@/components/ui/popover-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCharacterComment } from "@/hooks/mutations/use-create-character-comment";
import { useDeleteCharacterComment } from "@/hooks/mutations/use-delete-character-comment";
import { useUpdateCharacterComment } from "@/hooks/mutations/use-update-character-comment";
import { useCharacterCommentsQuery } from "@/hooks/queries/use-character-comments-query";
import { sortTopLevelComments } from "@/lib/character-comments-tree";
import { formatRelativeCommentTime } from "@/lib/character-detail";
import { getProfileInitials } from "@/lib/user-profile";
import type { CharacterComment } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharacterCommentsPanelProps = {
  characterId: string;
  enabled?: boolean;
};

type CommentSort = "newest" | "oldest";

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

function CommentListItem({
  comment,
  depth,
  isOwn,
  isEditing,
  editDraft,
  onEditDraftChange,
  onEditSubmit,
  onEditCancel,
  onEdit,
  onDelete,
  onReply,
  isDeleting,
  isBusy,
  showReplyButton,
}: {
  comment: CharacterComment;
  depth: "top" | "reply";
  isOwn: boolean;
  isEditing: boolean;
  editDraft: string;
  onEditDraftChange: (value: string) => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReply?: () => void;
  isDeleting?: boolean;
  isBusy: boolean;
  showReplyButton: boolean;
}) {
  const authorName = getAuthorName(comment);

  return (
    <article
      className={cn(
        "flex gap-3 border-b border-border/40 py-4 last:border-b-0",
        depth === "reply" && "border-b-0 py-3",
      )}
    >
      <Avatar
        className={cn("shrink-0", depth === "top" ? "h-9 w-9" : "h-7 w-7")}
      >
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
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeCommentTime(comment.created_at)}
            </time>
          </div>

          {isOwn && !isEditing ? (
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

        {!isEditing && depth === "top" ? (
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
            {showReplyButton && onReply ? (
              <button
                type="button"
                onClick={onReply}
                className="font-medium transition-colors hover:text-foreground"
              >
                Reply
              </button>
            ) : null}
          </div>
        ) : null}
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
  onReply,
  replyingToId,
  replyDraft,
  onReplyDraftChange,
  onReplySubmit,
  onReplyCancel,
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
  onReply: (commentId: string) => void;
  replyingToId: string | null;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
  isDeletingId: string | null;
  isBusy: boolean;
}) {
  const isEditingTop = editingCommentId === comment.id;

  return (
    <div>
      <CommentListItem
        comment={comment}
        depth="top"
        isOwn={Boolean(userId && comment.author.id === userId)}
        isEditing={isEditingTop}
        editDraft={editDraft}
        onEditDraftChange={onEditDraftChange}
        onEditSubmit={() => onEditSubmit(comment.id)}
        onEditCancel={onEditCancel}
        onEdit={() => onStartEdit(comment)}
        onDelete={() => onDelete(comment.id)}
        onReply={() => onReply(comment.id)}
        isDeleting={isDeletingId === comment.id}
        isBusy={isBusy}
        showReplyButton
      />

      {replyingToId === comment.id ? (
        <div className="mb-2 ml-12">
          <CommentComposer
            draft={replyDraft}
            onDraftChange={onReplyDraftChange}
            onSubmit={onReplySubmit}
            onCancel={onReplyCancel}
            isBusy={isBusy}
            isEditing={false}
            showComposer
            compact
            placeholder="Write a reply..."
          />
        </div>
      ) : null}

      {(comment.replies ?? []).length > 0 ? (
        <div className="ml-12 border-l border-border/50 pl-4">
          {(comment.replies ?? []).map((reply) => {
            const isEditingReply = editingCommentId === reply.id;
            return (
              <CommentListItem
                key={reply.id}
                comment={reply}
                depth="reply"
                isOwn={Boolean(userId && reply.author.id === userId)}
                isEditing={isEditingReply}
                editDraft={editDraft}
                onEditDraftChange={onEditDraftChange}
                onEditSubmit={() => onEditSubmit(reply.id)}
                onEditCancel={onEditCancel}
                onEdit={() => onStartEdit(reply)}
                onDelete={() => onDelete(reply.id)}
                isDeleting={isDeletingId === reply.id}
                isBusy={isBusy}
                showReplyButton={false}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function CharacterCommentsPanel({
  characterId,
  enabled = true,
}: CharacterCommentsPanelProps) {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [draft, setDraft] = useState("");
  const [sort, setSort] = useState<CommentSort>("newest");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
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
        toast.error("댓글 저장에 실패했습니다.");
      }
    });
  }

  async function handleReplySubmit() {
    const trimmed = replyDraft.trim();
    if (!trimmed || !replyingToId || isBusy) return;

    requireAuth(async () => {
      try {
        await createComment.mutateAsync({
          content: trimmed,
          parentId: replyingToId,
        });
        setReplyDraft("");
        setReplyingToId(null);
      } catch {
        toast.error("답글 저장에 실패했습니다.");
      }
    });
  }

  function handleStartEdit(comment: CharacterComment) {
    setReplyingToId(null);
    setReplyDraft("");
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
        toast.error("댓글 수정에 실패했습니다.");
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
        if (replyingToId === commentId) {
          setReplyingToId(null);
          setReplyDraft("");
        }
      } catch {
        toast.error("댓글 삭제에 실패했습니다.");
      } finally {
        setDeletingCommentId(null);
      }
    });
  }

  function handleReply(commentId: string) {
    requireAuth(() => {
      setEditingCommentId(null);
      setEditDraft("");
      setReplyingToId((prev) => (prev === commentId ? null : commentId));
      setReplyDraft("");
    });
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
        onSubmit={handleSubmitTopLevel}
        isBusy={isBusy}
        isEditing={false}
        showComposer
      />

      <div className="flex items-center justify-end gap-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setSort("newest")}
          className={cn(
            "transition-colors",
            sort === "newest"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Newest
        </button>
        <button
          type="button"
          onClick={() => setSort("oldest")}
          className={cn(
            "transition-colors",
            sort === "oldest"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
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
              onReply={handleReply}
              replyingToId={replyingToId}
              replyDraft={replyDraft}
              onReplyDraftChange={setReplyDraft}
              onReplySubmit={handleReplySubmit}
              onReplyCancel={() => {
                setReplyingToId(null);
                setReplyDraft("");
              }}
              isDeletingId={deletingCommentId}
              isBusy={isBusy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
