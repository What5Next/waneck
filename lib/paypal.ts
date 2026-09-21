import type { Json } from '@/lib/database.types'

const PAYPAL_API_BASE_BY_ENV = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
} as const

export class PayPalApiError extends Error {
  constructor(
    message: string,
    public readonly details: {
      environment: PayPalEnvironment
      status: number
      error?: string
      errorDescription?: string
    },
  ) {
    super(message)
    this.name = 'PayPalApiError'
  }
}

type PayPalEnvironment = keyof typeof PAYPAL_API_BASE_BY_ENV

type PayPalOrderResponse = {
  id: string
  status?: string
  [key: string]: Json | undefined
}

type PayPalCaptureResponse = {
  id: string
  status?: string
  payer?: {
    payer_id?: string
    email_address?: string
  }
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
        amount?: {
          currency_code?: string
          value?: string
        }
      }>
    }
  }>
  [key: string]: Json | undefined
}

type VerifyWebhookSignaturePayload = {
  auth_algo: string | null
  cert_url: string | null
  transmission_id: string | null
  transmission_sig: string | null
  transmission_time: string | null
  webhook_id: string
  webhook_event: Json
}

export type PayPalCaptureSummary = {
  captureId: string
  status: string
  amountValue: string
  currencyCode: string
  payerId: string | null
  payerEmail: string | null
  payload: PayPalCaptureResponse
}

function getPayPalEnvironment(): PayPalEnvironment {
  return process.env.PAYPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox'
}

export function getPayPalClientId() {
  return process.env.PAYPAL_CLIENT_ID ?? ''
}

export function getPayPalPublicConfig() {
  const clientId = getPayPalClientId()

  return {
    clientId,
    environment: getPayPalEnvironment(),
    currency: 'USD',
    enabled: Boolean(clientId && process.env.PAYPAL_CLIENT_SECRET),
  }
}

function getPayPalApiBase() {
  return PAYPAL_API_BASE_BY_ENV[getPayPalEnvironment()]
}

async function getPayPalAccessToken() {
  const clientId = getPayPalClientId()
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const environment = getPayPalEnvironment()

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured')
  }

  const response = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as {
    access_token?: string
    error?: string
    error_description?: string
  } | null

  if (!response.ok || !body?.access_token) {
    throw new PayPalApiError(
      body?.error_description ?? 'Failed to get PayPal access token',
      {
        environment,
        status: response.status,
        error: body?.error,
        errorDescription: body?.error_description,
      },
    )
  }

  return body.access_token
}

export async function createPayPalOrder(input: {
  paymentOrderId: string
  packageId: string
  priceAmount: string
  currencyCode: string
}) {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: input.paymentOrderId,
          invoice_id: input.paymentOrderId,
          description: `Nex package: ${input.packageId}`,
          amount: {
            currency_code: input.currencyCode,
            value: input.priceAmount,
          },
        },
      ],
    }),
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as PayPalOrderResponse | null

  if (!response.ok || !body?.id) {
    throw new Error('Failed to create PayPal order')
  }

  return body
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCaptureSummary> {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      cache: 'no-store',
    },
  )

  const body = (await response.json().catch(() => null)) as PayPalCaptureResponse | null
  const capture = body?.purchase_units?.[0]?.payments?.captures?.[0]

  if (!response.ok || !body || !capture?.id) {
    throw new Error('Failed to capture PayPal order')
  }

  return {
    captureId: capture.id,
    status: capture.status ?? body.status ?? 'UNKNOWN',
    amountValue: capture.amount?.value ?? '',
    currencyCode: capture.amount?.currency_code ?? '',
    payerId: body.payer?.payer_id ?? null,
    payerEmail: body.payer?.email_address ?? null,
    payload: body,
  }
}

export function isCompletedPayPalCapture(capture: PayPalCaptureSummary) {
  return capture.status.toUpperCase() === 'COMPLETED'
}

export async function verifyPayPalWebhookSignature(payload: VerifyWebhookSignaturePayload) {
  const accessToken = await getPayPalAccessToken()
  const response = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const body = (await response.json().catch(() => null)) as {
    verification_status?: string
  } | null

  if (!response.ok) {
    throw new Error('Failed to verify PayPal webhook signature')
  }

  return body?.verification_status === 'SUCCESS'
}
