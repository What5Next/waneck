-- Signup bonus (150 Nex)
-- Run this once in the Supabase SQL Editor before deploying the matching app
-- change. The script is safe to re-run: each auth user can receive this bonus
-- only once.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS token_transactions_one_signup_bonus_per_user
  ON public.token_transactions (user_id)
  WHERE type = 'signup_bonus';

CREATE OR REPLACE FUNCTION public.provision_signup_user(
  p_user_id UUID,
  p_email TEXT,
  p_display_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_balance_after INTEGER;
BEGIN
  -- Keep profile creation and the bonus ledger entry in one transaction.
  INSERT INTO public.users (id, email, display_name, token_balance)
  VALUES (p_user_id, p_email, p_display_name, 0)
  ON CONFLICT (id) DO NOTHING;

  -- Serializes concurrent OAuth callbacks and backfill calls for this user.
  PERFORM 1
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF EXISTS (
    SELECT 1
    FROM public.token_transactions
    WHERE user_id = p_user_id
      AND type = 'signup_bonus'
  ) THEN
    RETURN;
  END IF;

  UPDATE public.users
  SET token_balance = token_balance + 150
  WHERE id = p_user_id
  RETURNING token_balance INTO v_balance_after;

  IF v_balance_after IS NULL THEN
    RAISE EXCEPTION 'signup_bonus_user_not_found: %', p_user_id;
  END IF;

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    balance_after,
    type,
    description
  )
  VALUES (
    p_user_id,
    150,
    v_balance_after,
    'signup_bonus',
    'Signup bonus: 150 Nex'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.provision_signup_user(
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    )
  );

  RETURN NEW;
END;
$$;

-- Do not expose bonus provisioning as a PostgREST RPC.
REVOKE ALL ON FUNCTION public.provision_signup_user(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created_signup_bonus ON auth.users;
CREATE TRIGGER on_auth_user_created_signup_bonus
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill every existing account, including auth users whose public profile was
-- never created because an earlier OAuth flow did not reach the callback.
SELECT public.provision_signup_user(
  id,
  email,
  COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
)
FROM auth.users
WHERE email IS NOT NULL;

COMMIT;
