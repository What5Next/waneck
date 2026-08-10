import { NexShopView } from '@/components/nex/nex-shop-view'
import { MobileShell } from '@/components/mobile-shell'

export const metadata = {
  title: 'Top up Nex | whatsnext',
}

export default function NexShopPage() {
  return (
    <MobileShell>
      <NexShopView />
    </MobileShell>
  )
}
