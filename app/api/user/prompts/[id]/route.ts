import { NextRequest, NextResponse } from 'next/server'

import { requireAuthenticatedUser } from '@/lib/api/character-stats-auth'
import {
  USER_PROMPT_SELECT,
  getOwnedPrompt,
  parsePromptPatch,
  promoteNextDefaultPrompt,
} from '@/lib/api/user-default-settings-server'
import { supabaseAdmin } from '@/lib/supabase.server'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const existing = await getOwnedPrompt(auth.user.id, id)
    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = parsePromptPatch(body)
    if (parsed instanceof NextResponse) return parsed

    const { data, error } = await supabaseAdmin
      .from('user_prompts')
      .update({
        title: parsed.title,
        content: parsed.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select(USER_PROMPT_SELECT)
      .single()

    if (error || !data) {
      console.error('[/api/user/prompts/[id] PATCH]', error)
      return NextResponse.json(
        { error: error?.message ?? 'Failed to update prompt' },
        { status: 500 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[/api/user/prompts/[id] PATCH]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const auth = await requireAuthenticatedUser()
    if (auth.errorResponse) return auth.errorResponse

    const existing = await getOwnedPrompt(auth.user.id, id)
    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    const { count, error: countError } = await supabaseAdmin
      .from('user_prompts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)

    if (countError) {
      console.error('[/api/user/prompts/[id] DELETE count]', countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: 'At least one prompt is required' },
        { status: 400 },
      )
    }

    if (existing.is_default) {
      await promoteNextDefaultPrompt(auth.user.id, id)
    }

    const { error } = await supabaseAdmin
      .from('user_prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id)

    if (error) {
      console.error('[/api/user/prompts/[id] DELETE]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[/api/user/prompts/[id] DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
