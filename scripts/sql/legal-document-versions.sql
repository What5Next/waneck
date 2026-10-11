-- 이용약관 / 개인정보 처리방침 버전 관리
-- Supabase SQL Editor에서 페이지 배포 전에 실행. 본문은 별도로 등록.

BEGIN;

CREATE TABLE IF NOT EXISTS public.legal_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('terms', 'privacy')),
  version TEXT NOT NULL CHECK (version ~ '[^[:space:]]' AND version = btrim(version)),
  title TEXT NOT NULL CHECK (title ~ '[^[:space:]]'),
  content TEXT NOT NULL CHECK (content ~ '[^[:space:]]'),
  effective_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_type, version)
);

-- 같은 문서의 현행 버전을 시행 시각으로 명확히 결정.
CREATE UNIQUE INDEX IF NOT EXISTS legal_document_versions_published_effective_idx
  ON public.legal_document_versions (document_type, effective_at DESC)
  WHERE published_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_legal_document_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- 예약 공개도 확정된 버전으로 취급. 수정은 새로운 버전으로 등록.
  IF OLD.published_at IS NOT NULL THEN
    RAISE EXCEPTION 'Published legal document versions cannot be updated or deleted; create a new version instead.'
      USING ERRCODE = '55000';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_legal_document_version ON public.legal_document_versions;
CREATE TRIGGER protect_legal_document_version
  BEFORE UPDATE OR DELETE ON public.legal_document_versions
  FOR EACH ROW EXECUTE FUNCTION public.protect_legal_document_version();

ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.legal_document_versions FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.legal_document_versions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_document_versions TO service_role;

DROP POLICY IF EXISTS legal_document_versions_public_read ON public.legal_document_versions;
CREATE POLICY legal_document_versions_public_read
  ON public.legal_document_versions
  FOR SELECT TO anon, authenticated
  USING (published_at <= now() AND effective_at <= now());

COMMIT;
