import { NextRequest, NextResponse } from 'next/server'

import { PayPalApiError, capturePayPalOrder, isCompletedPayPalCapture } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase.server'
import { createClient } from '@/lib/supabase/server'

function sameMoney(expected: number | string, actual: string) {
  return Number(expected).toFixed(2) === Number(actual).toFixed(2)
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await ctx.params
    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: paymentOrder, error: orderError } = await supabaseAdmin
      .from('paypal_orders')
      .select('id, user_id, price_amount, currency_code, status, paypal_order_id')
      .eq('paypal_order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !paymentOrder) {
      return NextResponse.json({ error: 'Payment order not found' }, { status: 404 })
    }

    if (paymentOrder.status === 'credited') {
      const { data: existingTransaction, error: existingError } = await supabaseAdmin
        .from('token_transactions')
        .select('id, balance_after')
        .eq('payment_order_id', paymentOrder.id)
        .eq('type', 'purchase')
        .single()

      if (existingError || !existingTransaction) {
        throw new Error(existingError?.message ?? 'Credited transaction not found')
      }

      return NextResponse.json({
        paymentOrderId: paymentOrder.id,
        tokenBalance: existingTransaction.balance_after,
        transactionId: existingTransaction.id,
      })
    }

    const capture = await capturePayPalOrder(orderId)

    if (!isCompletedPayPalCapture(capture)) {
      await supabaseAdmin
        .from('paypal_orders')
        .update({
          capture_payload: capture.payload,
          status: 'failed',
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentOrder.id)

      return NextResponse.json({ error: 'PayPal capture was not completed' }, { status: 402 })
    }

    if (
      capture.currencyCode !== paymentOrder.currency_code ||
      !sameMoney(paymentOrder.price_amount, capture.amountValue)
    ) {
      await supabaseAdmin
        .from('paypal_orders')
        .update({
          capture_payload: capture.payload,
          status: 'failed',
          failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentOrder.id)

      return NextResponse.json({ error: 'PayPal capture amount mismatch' }, { status: 409 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({
        status: 'captured',
        paypal_capture_id: capture.captureId,
        paypal_payer_id: capture.payerId,
        paypal_payer_email: capture.payerEmail,
        capture_payload: capture.payload,
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentOrder.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    const { data: transaction, error: creditError } = await supabaseAdmin.rpc(
      'credit_paypal_order',
      { p_order_id: paymentOrder.id },
    )

    if (creditError || !transaction) {
      throw new Error(creditError?.message ?? 'Failed to credit Nex purchase')
    }

    return NextResponse.json({
      paymentOrderId: paymentOrder.id,
      tokenBalance: transaction.balance_after,
      transactionId: transaction.id,
    })
  } catch (error) {
    if (error instanceof PayPalApiError) {
      console.error('[/api/paypal/orders/[orderId]/capture POST] PayPal API error', error.details)
      return NextResponse.json(
        { error: 'PayPal credentials are invalid for the configured environment' },
        { status: 502 },
      )
    }

    console.error('[/api/paypal/orders/[orderId]/capture POST]', error)
    return NextResponse.json({ error: 'Failed to complete PayPal checkout' }, { status: 500 })
  }
}
