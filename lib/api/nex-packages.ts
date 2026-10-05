import { apiFetch } from '@/lib/api/client'

export type NexPackageSummary = {
  id: string
  nexAmount: number
  bonusNex: number
  priceAmount: number
  currencyCode: string
  sortOrder: number
}

export function getNexPackages() {
  return apiFetch<NexPackageSummary[]>('/api/nex/packages')
}
