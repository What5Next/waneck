-- 캐릭터 댓글 1단계 답글(parent_id) 마이그레이션
-- Supabase SQL Editor에서 실행. P0 preflight 후 필요 시 DROP 구문 주석 해제.

-- 기존 유저당 1댓글 제약이 있으면 제거 (Dashboard에서 이름 확인)
-- DROP INDEX IF EXISTS character_comments_character_id_user_id_key;
DROP INDEX IF EXISTS character_comments_one_top_level_per_user;

-- 1) parent_id 컬럼
ALTER TABLE character_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID
  REFERENCES character_comments(id) ON DELETE CASCADE;

-- 2) 답글 조회용 인덱스
CREATE INDEX IF NOT EXISTS character_comments_parent_id_idx
  ON character_comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- 3) comment_count trigger (없을 경우 신규, 있으면 기존 함수 확인 후 교체)
CREATE OR REPLACE FUNCTION sync_character_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE characters
    SET comment_count = comment_count + 1
    WHERE id = NEW.character_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE characters
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.character_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS character_comments_count_insert ON character_comments;
CREATE TRIGGER character_comments_count_insert
  AFTER INSERT ON character_comments
  FOR EACH ROW EXECUTE FUNCTION sync_character_comment_count();

DROP TRIGGER IF EXISTS character_comments_count_delete ON character_comments;
CREATE TRIGGER character_comments_count_delete
  AFTER DELETE ON character_comments
  FOR EACH ROW EXECUTE FUNCTION sync_character_comment_count();

-- 4) 기존 count 정합 (선택)
-- UPDATE characters c
-- SET comment_count = (
--   SELECT COUNT(*) FROM character_comments cc WHERE cc.character_id = c.id
-- );
