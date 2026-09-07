import { NextRequest, NextResponse } from 'next/server'

import { PayPalApiError, verifyPayPalWebhookSignature } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase.server'
import type { Json } from '@/lib/database.types'

type PayPalWebhookEvent = {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    status?: string
    amount?: {
      currency_code?: string
      value?: string
    }
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
  }
}

function getHeader(req: NextRequest, name: string) {
  return req.headers.get(name)
}

export async function POST(req: NextRequest) {
  const receivedAt = new Date().toISOString()
  let eventRowId: string | null = null

  try {
    const payload = (await req.json().catch(() => null)) as PayPalWebhookEvent | null

    if (!payload?.id || !payload.event_type) {
      return NextResponse.json({ error: 'Invalid PayPal webhook payload' }, { status: 400 })
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      return NextResponse.json({ error: 'PayPal webhook is not configured' }, { status: 500 })
    }

    const paypalOrderId = payload.resource?.supplementary_data?.related_ids?.order_id ?? null
    const paypalCaptureId = payload.resource?.id ?? null

    const { data: existingEvent } = await supabaseAdmin
      .from('paypal_webhook_events')
      .select('id, processing_status')
      .eq('paypal_event_id', payload.id)
      .maybeSingle()

    if (existingEvent?.processing_status === 'processed') {
      return NextResponse.json({ ok: true })
    }

    const verified = await verifyPayPalWebhookSignature({
      auth_algo: getHeader(req, 'paypal-auth-algo'),
      cert_url: getHeader(req, 'paypal-cert-url'),
      transmission_id: getHeader(req, 'paypal-transmission-id'),
      transmission_sig: getHeader(req, 'paypal-transmission-sig'),
      transmission_time: getHeader(req, 'paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: payload as Json,
    })

    if (!verified) {
      const { data } = await supabaseAdmin
        .from('paypal_webhook_events')
        .upsert(
          {
            paypal_event_id: payload.id,
            event_type: payload.event_type,
            paypal_order_id: paypalOrderId,
            paypal_capture_id: paypalCaptureId,
            transmission_id: getHeader(req, 'paypal-transmission-id'),
            transmission_time: getHeader(req, 'paypal-transmission-time'),
            cert_url: getHeader(req, 'paypal-cert-url'),
            auth_algo: getHeader(req, 'paypal-auth-algo'),
            transmission_sig: getHeader(req, 'paypal-transmission-sig'),
            webhook_id: webhookId,
            verification_status: 'failed',
            processing_status: 'failed',
            error_message: 'PayPal webhook signature verification failed',
            payload: payload as Json,
            received_at: receivedAt,
            processed_at: new Date().toISOString(),
          },
          { onConflict: 'paypal_event_id' },
        )
        .select('id')
        .single()

      eventRowId = data?.id ?? null
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const { data: eventRow, error: eventError } = await supabaseAdmin
      .from('paypal_webhook_events')
      .upsert(
        {
          paypal_event_id: payload.id,
          event_type: payload.event_type,
          paypal_order_id: paypalOrderId,
          paypal_capture_id: paypalCaptureId,
          transmission_id: getHeader(req, 'paypal-transmission-id'),
          transmission_time: getHeader(req, 'paypal-transmission-time'),
          cert_url: getHeader(req, 'paypal-cert-url'),
          auth_algo: getHeader(req, 'paypal-auth-algo'),
          transmission_sig: getHeader(req, 'paypal-transmission-sig'),
          webhook_id: webhookId,
          verification_status: 'success',
          processing_status: 'pending',
          payload: payload as Json,
          received_at: receivedAt,
        },
        { onConflict: 'paypal_event_id' },
      )
      .select('id')
      .single()

    if (eventError || !eventRow) {
      throw new Error(eventError?.message ?? 'Failed to store PayPal webhook event')
    }

    eventRowId = eventRow.id

    if (payload.event_type !== 'PAYMENT.CAPTURE.COMPLETED' || !paypalOrderId || !paypalCaptureId) {
      await supabaseAdmin
        .from('paypal_webhook_events')
        .update({ processing_status: 'ignored', processed_at: new Date().toISOString() })
        .eq('id', eventRow.id)

      return NextResponse.json({ ok: true })
    }

    const { data: paymentOrder, error: orderError } = await supabaseAdmin
      .from('paypal_orders')
      .select('id, price_amount, currency_code')
      .eq('paypal_order_id', paypalOrderId)
      .maybeSingle()

    if (orderError || !paymentOrder) {
      throw new Error(orderError?.message ?? 'PayPal order not found for webhook')
    }

    if (
      payload.resource?.status !== 'COMPLETED' ||
      payload.resource.amount?.currency_code !== paymentOrder.currency_code ||
      Number(payload.resource.amount?.value).toFixed(2) !== Number(paymentOrder.price_amount).toFixed(2)
    ) {
      throw new Error('PayPal webhook capture payload mismatch')
    }

    await supabaseAdmin
      .from('paypal_orders')
      .update({
        status: 'captured',
        paypal_capture_id: paypalCaptureId,
        capture_payload: payload as Json,
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentOrder.id)

    const { error: creditError } = await supabaseAdmin.rpc('credit_paypal_order', {
      p_order_id: paymentOrder.id,
    })

    if (creditError) {
      throw new Error(creditError.message)
    }

    await supabaseAdmin
      .from('paypal_webhook_events')
      .update({
        payment_order_id: paymentOrder.id,
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', eventRow.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof PayPalApiError) {
      console.error('[/api/paypal/webhook POST] PayPal API error', error.details)
    } else {
      console.error('[/api/paypal/webhook POST]', error)
    }

    if (eventRowId) {
      await supabaseAdmin
        .from('paypal_webhook_events')
        .update({
          processing_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Failed to process webhook',
          processed_at: new Date().toISOString(),
        })
        .eq('id', eventRowId)
    }

    return NextResponse.json({ error: 'Failed to process PayPal webhook' }, { status: 500 })
  }
}
