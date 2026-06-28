import type { CharacterComment } from "@/lib/types";

/** 답글을 부모 댓글 replies에 추가 */
export function appendReply(
  comments: CharacterComment[],
  parentId: string,
  reply: CharacterComment,
): CharacterComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), reply],
      };
    }
    return comment;
  });
}

/** 트리에서 commentId에 해당하는 댓글/답글 업데이트 (partial merge) */
export function updateInTree(
  comments: CharacterComment[],
  commentId: string,
  patch: CharacterComment,
): CharacterComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, ...patch, replies: comment.replies };
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateInTree(comment.replies, commentId, patch),
      };
    }
    return comment;
  });
}

/** 트리에서 commentId에 like 등 partial 패치 */
export function patchInTree(
  comments: CharacterComment[],
  commentId: string,
  patch: Partial<CharacterComment>,
): CharacterComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, ...patch, replies: comment.replies };
    }
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: patchInTree(comment.replies, commentId, patch),
      };
    }
    return comment;
  });
}

/** 트리에서 commentId 제거 (top-level 삭제 시 subtree 통째로) */
export function removeFromTree(
  comments: CharacterComment[],
  commentId: string,
): CharacterComment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => {
      if (!comment.replies?.length) return comment;
      return {
        ...comment,
        replies: removeFromTree(comment.replies, commentId),
      };
    });
}

/** 삭제될 row 수 계산 (top-level + replies) */
export function countSubtree(comment: CharacterComment): number {
  return (
    1 +
    (comment.replies?.reduce((sum, reply) => sum + countSubtree(reply), 0) ?? 0)
  );
}

/** 트리에서 commentId로 댓글 찾기 */
export function findInTree(
  comments: CharacterComment[],
  commentId: string,
): CharacterComment | undefined {
  for (const comment of comments) {
    if (comment.id === commentId) return comment;
    if (comment.replies?.length) {
      const found = findInTree(comment.replies, commentId);
      if (found) return found;
    }
  }
  return undefined;
}

/** top-level만 정렬 (replies는 각각 ASC 유지) */
export function sortTopLevelComments(
  comments: CharacterComment[],
  sort: "newest" | "oldest",
): CharacterComment[] {
  const sorted = [...comments];
  sorted.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sort === "newest" ? bTime - aTime : aTime - bTime;
  });
  return sorted.map((comment) => ({
    ...comment,
    replies: [...(comment.replies ?? [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  }));
}
