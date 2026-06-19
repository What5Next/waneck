import { WonShopView } from '@/components/won/won-shop-view'
import { MobileShell } from '@/components/mobile-shell'

export const metadata = {
  title: 'won 충전 | 와넥',
}

export default function WonShopPage() {
  return (
    <MobileShell>
      <WonShopView />
    </MobileShell>
  )
}
