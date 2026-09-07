import { apiFetch } from '@/lib/api/client'

export type PayPalConfig = {
  clientId: string
  environment: 'sandbox' | 'live'
  currency: string
  enabled: boolean
}

export type CreatePayPalOrderInput = {
  packageId: string
}

export type CreatePayPalOrderResponse = {
  orderId: string
  paymentOrderId: string
}

export type CapturePayPalOrderResponse = {
  paymentOrderId: string
  tokenBalance: number
  transactionId: string
}

export function getPayPalConfig() {
  return apiFetch<PayPalConfig>('/api/paypal/config')
}

export function createPayPalOrder(input: CreatePayPalOrderInput) {
  return apiFetch<CreatePayPalOrderResponse>('/api/paypal/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function capturePayPalOrder(orderId: string) {
  return apiFetch<CapturePayPalOrderResponse>(
    `/api/paypal/orders/${encodeURIComponent(orderId)}/capture`,
    { method: 'POST' },
  )
}
