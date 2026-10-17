"use client";

import { useState } from 'react'

import type { Character, CharacterSituationImage, CharacterWithDetail } from "@/lib/types";
import type { Message } from "@/lib/types";
import { ChatHeader } from "@/components/chat/chat-header";
import { MobileShell } from "@/components/mobile-shell";
import ChatWindow from "@/components/chat-window";
import { CharacterDetailModal } from '@/components/character-detail-modal'
import { useCharacterQuery } from '@/hooks/queries/use-character-query'

export function ChatPageClient({
  character,
  conversationId,
  initialMessages,
  showOpeningSuggestions,
  situationImages,
  openingImageUrl,
}: {
  character: Character;
  conversationId: string;
  initialMessages: Message[];
  showOpeningSuggestions: boolean;
  situationImages: CharacterSituationImage[];
  openingImageUrl: string;
}) {
  const [infoOpen, setInfoOpen] = useState(false)
  const { data: detail } = useCharacterQuery(character.id)
  const initialDetail: CharacterWithDetail = {
    ...character,
    creator: null,
    intro_messages: [],
    situation_images: [],
  }
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader
        characterId={character.id}
        characterName={character.name}
        conversationId={conversationId}
        onOpenCharacterInfo={() => setInfoOpen(true)}
      />

      <div className="flex min-h-0 flex-1 w-full justify-center">
        <MobileShell>
          <ChatWindow
            character={character}
            conversationId={conversationId}
            initialMessages={initialMessages}
            showOpeningSuggestions={showOpeningSuggestions}
            situationImages={situationImages}
            openingImageUrl={openingImageUrl}
            onOpenCharacterInfo={() => setInfoOpen(true)}
          />
        </MobileShell>
      </div>
      {infoOpen ? <CharacterDetailModal character={detail ?? initialDetail} closeMode="overlay" onClose={() => setInfoOpen(false)} /> : null}
    </div>
  );
}
