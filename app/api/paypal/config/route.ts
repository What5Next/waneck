import { NextResponse } from 'next/server'

import { getPayPalPublicConfig } from '@/lib/paypal'

export async function GET() {
  return NextResponse.json(getPayPalPublicConfig())
}
