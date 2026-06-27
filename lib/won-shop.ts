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
  { id: 'purchase', label: 'Buy won' },
  { id: 'free', label: 'Get free won' },
]

export const WON_PACKAGES: WonPackage[] = [
  { id: 'won-100', wonAmount: 100, priceKrw: 1100 },
  { id: 'won-500', wonAmount: 500, priceKrw: 5500, badge: 'Popular' },
  { id: 'won-1000', wonAmount: 1000, priceKrw: 11000, bonusWon: 50 },
  { id: 'won-3000', wonAmount: 3000, priceKrw: 33000, bonusWon: 200 },
]

export const WON_PAYMENT_METHODS: {
  id: WonPaymentMethod
  label: string
  description?: string
}[] = [
  { id: 'card', label: 'Credit / debit card' },
  { id: 'transfer', label: 'Bank transfer' },
  { id: 'mobile', label: 'Mobile payment' },
]

export const WON_REFUND_NOTICES = [
  'You may request a refund within 7 days of purchase.',
  'Refunds are not available if any purchased won has been used, even within 7 days.',
  'If any won has been used, remaining balance cannot be refunded.',
  'Paid won expires 5 years from the date earned.',
  'Free won expiration varies by grant method.',
  'Won with the nearest expiration date is used first automatically.',
] as const
