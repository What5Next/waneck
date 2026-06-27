export type WonPurchaseTab = 'purchase' | 'free'

export type WonPaymentMethod = 'card' | 'transfer' | 'mobile'

export type WonPackage = {
  id: string
  wonAmount: number
  priceKrw: number
  bonusWon?: number
  badge?: string
}

export const WON_PURCHASE_TABS: { id: WonPurchaseTab; label: string }[] = [
  { id: 'purchase', label: '일반 구매' },
  { id: 'free', label: '무료로 받기' },
]

export const WON_PACKAGES: WonPackage[] = [
  { id: 'won-100', wonAmount: 100, priceKrw: 1100 },
  { id: 'won-500', wonAmount: 500, priceKrw: 5500, badge: '인기' },
  { id: 'won-1000', wonAmount: 1000, priceKrw: 11000, bonusWon: 50 },
  { id: 'won-3000', wonAmount: 3000, priceKrw: 33000, bonusWon: 200 },
]

export const WON_PAYMENT_METHODS: {
  id: WonPaymentMethod
  label: string
  description?: string
}[] = [
  { id: 'card', label: '신용/체크카드' },
  { id: 'transfer', label: '계좌 이체' },
  { id: 'mobile', label: '휴대폰 결제' },
]

export const WON_REFUND_NOTICES = [
  '모든 결제 상품은 결제일로부터 7일 이내 환불을 요청할 수 있습니다.',
  '7일 이내여도 구매한 won을 사용한 이력이 있다면 환불이 불가능합니다.',
  '사용 이력이 있을 경우, 남은 won에 대한 환불은 불가능합니다.',
  '유료로 구매한 won의 유효기간은 획득 시점으로부터 5년입니다.',
  '무료 won은 지급 방식에 따라 유효기간이 다릅니다.',
  'won은 유효기간이 임박한 순서대로 자동으로 사용됩니다.',
] as const
