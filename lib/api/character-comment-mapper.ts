import type { CharacterComment } from "@/lib/types";

const COMMENT_SELECT = `
  id,
  content,
  created_at,
  updated_at,
  user_id,
  parent_id,
  author:users!character_comments_user_id_fkey(display_name)
`;

export { COMMENT_SELECT };

export type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  author:
    | { display_name: string | null }
    | { display_name: string | null }[]
    | null;
};

/** DB row → API CharacterComment */
export function mapCommentRow(row: CommentRow): CharacterComment {
  const author = Array.isArray(row.author) ? row.author[0] : row.author;
  return {
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    parent_id: row.parent_id ?? null,
    author: {
      id: row.user_id,
      display_name: author?.display_name ?? null,
    },
  };
}

/** flat replies → top-level에 replies[] 붙이기 */
export function nestComments(
  topLevel: CharacterComment[],
  replies: CharacterComment[],
): CharacterComment[] {
  const repliesByParent = new Map<string, CharacterComment[]>();

  for (const reply of replies) {
    if (!reply.parent_id) continue;
    const bucket = repliesByParent.get(reply.parent_id) ?? [];
    bucket.push(reply);
    repliesByParent.set(reply.parent_id, bucket);
  }

  return topLevel.map((comment) => ({
    ...comment,
    replies: repliesByParent.get(comment.id) ?? [],
  }));
}
