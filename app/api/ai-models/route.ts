import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase.server'

/** 활성 AI 모델 목록 (sort_order → display_name 순) */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('ai_models')
    .select('id, model_name, display_name, description, token_cost, provider, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('display_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
