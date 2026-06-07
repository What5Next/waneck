import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// 서버 전용 클라이언트 — service role key로 RLS 우회
// 절대 클라이언트 컴포넌트에서 import 하지 말 것
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
