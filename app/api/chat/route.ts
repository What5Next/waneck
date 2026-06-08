import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase.server'
import { createClient } from '@/lib/supabase/server'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export type Message = {
  role: 'user' | 'model'
  content: string
}

async function getOrCreateConversation(characterId: string, userId: string, conversationId?: string): Promise<string> {
  if (conversationId) return conversationId

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ character_id: characterId, user_id: userId })
    .select('id')
    .single()

  if (error) throw new Error(`conversation 생성 실패: ${error.message}`)
  return data.id
}

export async function POST(req: NextRequest) {
  try {
    const { characterId, messages, conversationId: existingConvId, model = 'gemini-2.5-flash' } = await req.json() as {
      characterId: string
      messages: Message[]
      conversationId?: string
      model?: string
    }

    const { data: character } = await supabase
      .from('characters')
      .select('system_prompt')
      .eq('id', characterId)
      .single()

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    const contents = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }))

    const systemInstruction = character.system_prompt +
      '\n\n행동이나 상황을 묘사할 때는 *행동 내용* 형식으로 별표 하나로 감싸서 표현하세요. 예: *조용히 미소 지으며* 안녕하세요.'

    const res = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1000,
      },
    })

    const reply = res.text ?? '...'

    // 로그인된 유저가 있으면 DB에 저장
    let conversationId: string | null = existingConvId ?? null
    try {
      const authClient = await createClient()
      const { data: { user } } = await authClient.auth.getUser()

      if (user) {
        const lastUserMsg = messages[messages.length - 1]
        conversationId = await getOrCreateConversation(characterId, user.id, existingConvId)

        await supabaseAdmin.from('messages').insert([
          { conversation_id: conversationId, role: lastUserMsg.role, content: lastUserMsg.content },
          { conversation_id: conversationId, role: 'model', content: reply },
        ])

        await supabaseAdmin
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId)
      }
    } catch (dbErr) {
      console.error('[/api/chat] DB 저장 실패:', dbErr)
    }

    return NextResponse.json({ reply, conversationId })
  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
