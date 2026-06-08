import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase.server'

export async function POST(req: NextRequest) {
  try {
    const { characterId } = await req.json() as { characterId: string }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('character_id', characterId)
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ conversationId: existing.id })
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ character_id: characterId, user_id: user.id })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ conversationId: data.id })
  } catch (err) {
    console.error('[/api/conversations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
