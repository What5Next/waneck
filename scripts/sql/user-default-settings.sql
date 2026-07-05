-- My Page Default settings (prompt / persona / preferences)
-- Supabase SQL Editor에서 수동 실행.

CREATE TABLE IF NOT EXISTS user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_prompts_one_default
  ON user_prompts (user_id) WHERE is_default;

CREATE INDEX IF NOT EXISTS user_prompts_user_idx ON user_prompts (user_id);

CREATE TABLE IF NOT EXISTS user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_personas_one_default
  ON user_personas (user_id) WHERE is_default;

CREATE INDEX IF NOT EXISTS user_personas_user_idx ON user_personas (user_id);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  session_note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS (방어 목적 — API는 service-role 사용)
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_prompts_own ON user_prompts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_personas_own ON user_personas
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_own ON user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
