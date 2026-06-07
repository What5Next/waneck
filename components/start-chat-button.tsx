'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function StartChatButton({ characterId }: { characterId: string }) {
  const router = useRouter()

  function handleClick() {
    const seed = crypto.randomUUID()
    router.push(`/chat/${characterId}/${seed}`)
  }

  return (
    <Button onClick={handleClick} className="w-full rounded-xl py-3 text-base font-semibold">
      바로 채팅
    </Button>
  )
}
