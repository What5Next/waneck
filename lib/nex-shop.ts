export type NexPaymentMethod = 'card' | 'transfer' | 'mobile'

export type NexPackage = {
  id: string
  nexAmount: number
  priceUsd: number
  bonusNex?: number
  badge?: string
}

export const NEX_PACKAGES: NexPackage[] = [
  { id: 'nex-starter', nexAmount: 500, priceUsd: 4.99 },
  { id: 'nex-basic', nexAmount: 1000, priceUsd: 9.99, bonusNex: 50 },
  {
    id: 'nex-popular',
    nexAmount: 2500,
    priceUsd: 24.99,
    bonusNex: 375,
    badge: 'Popular',
  },
  { id: 'nex-best-value', nexAmount: 6000, priceUsd: 59.99, bonusNex: 1800 },
  { id: 'nex-mega', nexAmount: 15000, priceUsd: 149.99, bonusNex: 7500 },
]

export const NEX_PAYMENT_METHODS: {
  id: NexPaymentMethod
  label: string
  description?: string
}[] = [
  { id: 'card', label: 'Credit / debit card' },
  { id: 'transfer', label: 'Bank transfer' },
  { id: 'mobile', label: 'Mobile payment' },
]

export const NEX_REFUND_NOTICES = [
  'You may request a refund within 7 days of purchase.',
  'Refunds are not available if any purchased Nex has been used, even within 7 days.',
  'If any Nex has been used, remaining balance cannot be refunded.',
  'Paid Nex expires 5 years from the date earned.',
  'Free Nex expiration varies by grant method.',
  'Nex with the nearest expiration date is used first automatically.',
] as const
