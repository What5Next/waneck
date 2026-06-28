import { supabaseAdmin } from '@/lib/supabase.server'

export type CommentLikeStats = {
  likeCountByCommentId: Map<string, number>
  likedCommentIds: Set<string>
}

/** comment_id 목록에 대한 like count + (선택) 현재 유저 liked set */
export async function fetchCommentLikeStats(
  commentIds: string[],
  userId?: string | null,
): Promise<CommentLikeStats> {
  const likeCountByCommentId = new Map<string, number>()
  const likedCommentIds = new Set<string>()

  if (commentIds.length === 0) {
    return { likeCountByCommentId, likedCommentIds }
  }

  const { data, error } = await supabaseAdmin
    .from('character_comment_likes')
    .select('comment_id, user_id')
    .in('comment_id', commentIds)

  if (error) {
    throw error
  }

  for (const row of data ?? []) {
    likeCountByCommentId.set(
      row.comment_id,
      (likeCountByCommentId.get(row.comment_id) ?? 0) + 1,
    )
    if (userId && row.user_id === userId) {
      likedCommentIds.add(row.comment_id)
    }
  }

  return { likeCountByCommentId, likedCommentIds }
}

/** 단일 댓글 like_count 조회 */
export async function getCommentLikeCount(commentId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('character_comment_likes')
    .select('id', { count: 'exact', head: true })
    .eq('comment_id', commentId)

  if (error) {
    throw error
  }

  return count ?? 0
}
