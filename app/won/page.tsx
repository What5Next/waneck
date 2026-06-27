import { WonShopView } from '@/components/won/won-shop-view'
import { MobileShell } from '@/components/mobile-shell'

export const metadata = {
  title: 'Top up won | Waneck',
}

export default function WonShopPage() {
  return (
    <MobileShell>
      <WonShopView />
    </MobileShell>
  )
}
