-- PayPal Nex purchase tables
-- Supabase SQL Editor에서 수동 실행.
--
-- 결제 처리 흐름:
-- 1) 서버에서 nex_packages를 기준으로 paypal_orders row 생성
-- 2) PayPal Orders API로 order 생성 후 paypal_order_id 저장
-- 3) 승인/capture/webhook 성공 시 credit_paypal_order(order_id) 호출
-- 4) users.token_balance 증가 + token_transactions 원장 1회 기록

CREATE TABLE IF NOT EXISTS nex_packages (
  id TEXT PRIMARY KEY,
  nex_amount INT NOT NULL CHECK (nex_amount > 0),
  bonus_nex INT NOT NULL DEFAULT 0 CHECK (bonus_nex >= 0),
  price_amount NUMERIC(10, 2) NOT NULL CHECK (price_amount > 0),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nex_packages_active_sort_idx
  ON nex_packages (is_active, sort_order);

INSERT INTO nex_packages (
  id, nex_amount, bonus_nex, price_amount, currency_code, sort_order
)
VALUES
  ('nex-starter', 500, 0, 4.99, 'USD', 10),
  ('nex-basic', 1000, 50, 9.99, 'USD', 20),
  ('nex-popular', 2500, 375, 24.99, 'USD', 30),
  ('nex-best-value', 6000, 1800, 59.99, 'USD', 40),
  ('nex-mega', 15000, 7500, 149.99, 'USD', 50)
ON CONFLICT (id) DO UPDATE
SET
  nex_amount = EXCLUDED.nex_amount,
  bonus_nex = EXCLUDED.bonus_nex,
  price_amount = EXCLUDED.price_amount,
  currency_code = EXCLUDED.currency_code,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

CREATE TABLE IF NOT EXISTS paypal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES nex_packages(id) ON DELETE RESTRICT,
  nex_amount INT NOT NULL CHECK (nex_amount > 0),
  bonus_nex INT NOT NULL DEFAULT 0 CHECK (bonus_nex >= 0),
  total_nex INT GENERATED ALWAYS AS (nex_amount + bonus_nex) STORED,
  price_amount NUMERIC(10, 2) NOT NULL CHECK (price_amount > 0),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paypal_created', 'approved', 'captured', 'credited', 'cancelled', 'failed', 'refunded')),
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  paypal_payer_id TEXT,
  paypal_payer_email TEXT,
  order_payload JSONB,
  capture_payload JSONB,
  approved_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  credited_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paypal_orders_user_created_idx
  ON paypal_orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS paypal_orders_status_idx
  ON paypal_orders (status);

CREATE INDEX IF NOT EXISTS paypal_orders_package_idx
  ON paypal_orders (package_id);

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  payment_order_id UUID REFERENCES paypal_orders(id) ON DELETE SET NULL,
  transmission_id TEXT,
  transmission_time TIMESTAMPTZ,
  cert_url TEXT,
  auth_algo TEXT,
  transmission_sig TEXT,
  webhook_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'success', 'failed')),
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processed', 'ignored', 'failed')),
  error_message TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS paypal_webhook_events_order_idx
  ON paypal_webhook_events (paypal_order_id);

CREATE INDEX IF NOT EXISTS paypal_webhook_events_capture_idx
  ON paypal_webhook_events (paypal_capture_id);

CREATE INDEX IF NOT EXISTS paypal_webhook_events_processing_idx
  ON paypal_webhook_events (processing_status, received_at);

ALTER TABLE token_transactions
  ADD COLUMN IF NOT EXISTS payment_order_id UUID
  REFERENCES paypal_orders(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS token_transactions_one_purchase_per_paypal_order
  ON token_transactions (payment_order_id)
  WHERE payment_order_id IS NOT NULL AND type = 'purchase';

CREATE INDEX IF NOT EXISTS token_transactions_payment_order_idx
  ON token_transactions (payment_order_id)
  WHERE payment_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION credit_paypal_order(p_order_id UUID)
RETURNS token_transactions AS $$
DECLARE
  v_order paypal_orders%ROWTYPE;
  v_existing token_transactions%ROWTYPE;
  v_balance_after INT;
  v_transaction token_transactions%ROWTYPE;
BEGIN
  SELECT *
  INTO v_order
  FROM paypal_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'paypal_order_not_found: %', p_order_id;
  END IF;

  IF v_order.status NOT IN ('captured', 'credited') THEN
    RAISE EXCEPTION 'paypal_order_not_captured: %, status=%', p_order_id, v_order.status;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_order_id::TEXT));

  SELECT *
  INTO v_existing
  FROM token_transactions
  WHERE payment_order_id = p_order_id
    AND type = 'purchase'
  LIMIT 1;

  IF FOUND THEN
    UPDATE paypal_orders
    SET
      status = 'credited',
      credited_at = COALESCE(credited_at, now()),
      updated_at = now()
    WHERE id = p_order_id
      AND status <> 'credited';

    RETURN v_existing;
  END IF;

  UPDATE users
  SET token_balance = token_balance + v_order.total_nex
  WHERE id = v_order.user_id
  RETURNING token_balance INTO v_balance_after;

  IF v_balance_after IS NULL THEN
    RAISE EXCEPTION 'user_not_found_for_paypal_order: %, user_id=%', p_order_id, v_order.user_id;
  END IF;

  INSERT INTO token_transactions (
    user_id,
    amount,
    balance_after,
    type,
    description,
    external_ref,
    payment_order_id
  )
  VALUES (
    v_order.user_id,
    v_order.total_nex,
    v_balance_after,
    'purchase',
    'PayPal Nex purchase: ' || v_order.package_id,
    v_order.paypal_capture_id,
    v_order.id
  )
  RETURNING * INTO v_transaction;

  UPDATE paypal_orders
  SET
    status = 'credited',
    credited_at = COALESCE(credited_at, now()),
    updated_at = now()
  WHERE id = p_order_id;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS (방어 목적 — 결제 생성/웹훅/지급은 service-role 사용)
ALTER TABLE nex_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nex_packages_active_read ON nex_packages;
CREATE POLICY nex_packages_active_read ON nex_packages
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS paypal_orders_own_read ON paypal_orders;
CREATE POLICY paypal_orders_own_read ON paypal_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- paypal_webhook_events는 client 접근 정책을 만들지 않는다.
