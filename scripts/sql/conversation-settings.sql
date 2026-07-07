-- Conversation settings snapshot (persona / prompt / preferences)
-- Supabase SQL Editor에서 수동 실행.

CREATE TABLE IF NOT EXISTS conversation_settings (
  conversation_id     UUID PRIMARY KEY
    REFERENCES conversations(id) ON DELETE CASCADE,
  -- persona snapshot (default persona 복사본)
  persona_name        TEXT NOT NULL DEFAULT '',
  persona_description TEXT NOT NULL DEFAULT '',
  persona_image_url   TEXT,
  -- prompt snapshot (default prompt 복사본)
  prompt_title        TEXT NOT NULL DEFAULT '',
  prompt_content      TEXT NOT NULL DEFAULT '',
  -- preferences snapshot
  model_id            UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  session_note        TEXT NOT NULL DEFAULT '',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS (방어 목적 — API는 service-role 사용)
ALTER TABLE conversation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_settings_own ON conversation_settings;
CREATE POLICY conversation_settings_own ON conversation_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_settings.conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_settings.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- 기존 대화 백필: 해당 유저 default-settings를 값 복사한다.
INSERT INTO conversation_settings (
  conversation_id, persona_name, persona_description, persona_image_url,
  prompt_title, prompt_content, model_id, session_note
)
SELECT
  c.id,
  COALESCE(per.name, ''),
  COALESCE(per.description, ''),
  per.image_url,
  COALESCE(pr.title, ''),
  COALESCE(pr.content, ''),
  pref.default_model_id,
  COALESCE(pref.session_note, '')
FROM conversations c
LEFT JOIN LATERAL (
  SELECT name, description, image_url
  FROM user_personas up
  WHERE up.user_id = c.user_id
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1
) per ON true
LEFT JOIN LATERAL (
  SELECT title, content
  FROM user_prompts up
  WHERE up.user_id = c.user_id
  ORDER BY is_default DESC, sort_order ASC, created_at ASC
  LIMIT 1
) pr ON true
LEFT JOIN user_preferences pref ON pref.user_id = c.user_id
ON CONFLICT (conversation_id) DO NOTHING;
