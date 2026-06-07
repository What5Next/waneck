import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export type Message = {
  role: 'user' | 'model'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { characterId, messages } = await req.json() as {
      characterId: string
      messages: Message[]
    }

    const { data: character } = await supabase
      .from('characters')
      .select('system_prompt')
      .eq('id', characterId)
      .single()

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Gemini multi-turn: contents 배열로 히스토리 전달
    const contents = messages.map((m) => ({
      role: m.role, // 'user' | 'model'
      parts: [{ text: m.content }],
    }))

    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: character.system_prompt,
        maxOutputTokens: 1000,
      },
    })

    const reply = res.text ?? '...'
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
