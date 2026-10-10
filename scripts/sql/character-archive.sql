-- 캐릭터 아카이브 플래그 마이그레이션
-- Supabase SQL Editor에서 실행.
--
-- is_archived = true 인 캐릭터는 목록/추천/상세/채팅 전부에서 제외된다.
-- (is_public 과는 별개 축: is_public 은 공개 여부, is_archived 는 운영상 보관 처리)

-- 1) 컬럼 추가
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- 2) 조회 경로가 항상 is_archived = false 를 거르므로 부분 인덱스로 커버
CREATE INDEX IF NOT EXISTS characters_active_public_idx
  ON characters (is_public, created_at)
  WHERE is_archived = false;

-- 3) 기존에 올라가 있는 캐릭터 전부 아카이브
--    (신규 생성분까지 묻히지 않게 적용 시점 기준으로 한 번만 실행)
UPDATE characters
SET is_archived = true
WHERE is_archived = false;

-- 확인
--   SELECT is_archived, count(*) FROM characters GROUP BY is_archived;
--
-- 되돌리기 (특정 캐릭터만 복구)
--   UPDATE characters SET is_archived = false WHERE id = '<uuid>';
