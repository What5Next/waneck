import { notFound } from 'next/navigation'

import { getCharacter } from '@/lib/characters'
import ChatWindow from '@/components/chat-window'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string; seed: string }>
}) {
  const { characterId, seed } = await params
  const character = getCharacter(characterId)
  if (!character) notFound()

  return <ChatWindow character={character} seed={seed} />
}
