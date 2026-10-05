import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase.server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('nex_packages')
      .select('id, nex_amount, bonus_nex, price_amount, currency_code, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('price_amount', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json(
      (data ?? []).map((item) => ({
        id: item.id,
        nexAmount: item.nex_amount,
        bonusNex: item.bonus_nex,
        priceAmount: item.price_amount,
        currencyCode: item.currency_code,
        sortOrder: item.sort_order,
      })),
    )
  } catch (error) {
    console.error('[/api/nex/packages GET]', error)
    return NextResponse.json(
      { error: 'Failed to load Nex packages' },
      { status: 500 },
    )
  }
}
