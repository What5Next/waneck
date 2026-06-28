-- 캐릭터 댓글/대댓글 좋아요 마이그레이션
-- Supabase SQL Editor에서 실행.
--
-- P0 preflight: character-comment-replies.sql 적용 여부 확인
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'character_comments' AND column_name = 'parent_id';
-- parent_id 없으면 character-comment-replies.sql 먼저 실행.

CREATE TABLE IF NOT EXISTS character_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES character_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS character_comment_likes_comment_id_idx
  ON character_comment_likes (comment_id);

CREATE INDEX IF NOT EXISTS character_comment_likes_user_id_idx
  ON character_comment_likes (user_id);
