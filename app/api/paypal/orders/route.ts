import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase.server'
import { createClient } from '@/lib/supabase/server'
import { PayPalApiError, createPayPalOrder } from '@/lib/paypal'

function formatPayPalAmount(amount: number | string) {
  return Number(amount).toFixed(2)
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      packageId?: unknown
    } | null

    if (!body || typeof body.packageId !== 'string' || !body.packageId.trim()) {
      return NextResponse.json({ error: 'packageId is required' }, { status: 400 })
    }

    const { data: nexPackage, error: packageError } = await supabaseAdmin
      .from('nex_packages')
      .select('id, nex_amount, bonus_nex, price_amount, currency_code')
      .eq('id', body.packageId)
      .eq('is_active', true)
      .single()

    if (packageError || !nexPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const { data: paymentOrder, error: orderInsertError } = await supabaseAdmin
      .from('paypal_orders')
      .insert({
        user_id: user.id,
        package_id: nexPackage.id,
        nex_amount: nexPackage.nex_amount,
        bonus_nex: nexPackage.bonus_nex,
        price_amount: nexPackage.price_amount,
        currency_code: nexPackage.currency_code,
        status: 'created',
      })
      .select('id')
      .single()

    if (orderInsertError || !paymentOrder) {
      throw new Error(orderInsertError?.message ?? 'Failed to create payment order')
    }

    const paypalOrder = await createPayPalOrder({
      paymentOrderId: paymentOrder.id,
      packageId: nexPackage.id,
      priceAmount: formatPayPalAmount(nexPackage.price_amount),
      currencyCode: nexPackage.currency_code,
    })

    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({
        paypal_order_id: paypalOrder.id,
        order_payload: paypalOrder,
        status: 'paypal_created',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentOrder.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({
      orderId: paypalOrder.id,
      paymentOrderId: paymentOrder.id,
    })
  } catch (error) {
    if (error instanceof PayPalApiError) {
      console.error('[/api/paypal/orders POST] PayPal API error', error.details)
      return NextResponse.json(
        { error: 'PayPal credentials are invalid for the configured environment' },
        { status: 502 },
      )
    }

    console.error('[/api/paypal/orders POST]', error)
    return NextResponse.json({ error: 'Failed to start PayPal checkout' }, { status: 500 })
  }
}
