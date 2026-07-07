/** lazy-seed 및 API/UI 공통 검증 상수 */

export const DEFAULT_PROMPT_TITLE = 'Default prompt'
export const NEW_PROMPT_TITLE = 'New prompt'

export const PROMPT_TITLE_MAX = 50
export const PROMPT_CONTENT_MAX = 8000
export const PERSONA_NAME_MAX = 50
export const PERSONA_DESC_MAX = 4000
export const SESSION_NOTE_MAX = 2000

export const USER_PROMPT_SELECT =
  'id, user_id, title, content, is_default, sort_order, created_at, updated_at'

export const USER_PERSONA_SELECT =
  'id, user_id, name, description, image_url, is_default, created_at, updated_at'

export const USER_PREFERENCES_SELECT =
  'user_id, default_model_id, session_note, updated_at'

export const CONVERSATION_SETTINGS_SELECT =
  'conversation_id, persona_name, persona_description, persona_image_url, prompt_title, prompt_content, model_id, session_note, updated_at'
