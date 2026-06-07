import { notFound } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import ChatWindow from '@/components/chat-window'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string; seed: string }>
}) {
  const { characterId, seed } = await params
  const { data: character } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()

  if (!character) notFound()

  return <ChatWindow character={character} seed={seed} />
}
