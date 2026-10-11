-- legal-document-versions.sql 적용 후 실행. 모든 테스트 데이터는 ROLLBACK.
BEGIN;

INSERT INTO public.legal_document_versions
  (document_type, version, title, content, effective_at, published_at)
VALUES
  ('terms', '__test_legal_old', 'Terms', '# Old terms', '1900-01-01Z', '1900-01-01Z'),
  ('terms', '__test_legal_current', 'Terms', '# Current terms', '1900-01-02Z', '1900-01-02Z'),
  ('privacy', '__test_legal_current', 'Privacy', '# Privacy', '1900-01-02Z', '1900-01-02Z'),
  ('terms', '__test_legal_draft', 'Draft', '# Draft', '1900-01-03Z', NULL),
  ('terms', '__test_legal_hidden_draft', 'Hidden draft', '# Hidden', '1900-01-05Z', NULL),
  ('terms', '__test_legal_future_effective', 'Future', '# Future effective', now() + interval '100 years', now()),
  ('terms', '__test_legal_future_published', 'Future', '# Future published', '1900-01-04Z', now() + interval '100 years');

DO $$
BEGIN
  BEGIN
    UPDATE public.legal_document_versions SET content = '# Changed'
      WHERE version = '__test_legal_current';
    RAISE EXCEPTION 'FAIL: published update allowed';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    DELETE FROM public.legal_document_versions WHERE version = '__test_legal_old';
    RAISE EXCEPTION 'FAIL: published delete allowed';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    UPDATE public.legal_document_versions SET published_at = NULL
      WHERE version = '__test_legal_future_effective';
    RAISE EXCEPTION 'FAIL: scheduled publication could be undone';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    INSERT INTO public.legal_document_versions (document_type, version, title, content, effective_at)
      VALUES ('terms', '__test_legal_current', 'Terms', '# Duplicate', now());
    RAISE EXCEPTION 'FAIL: duplicate version allowed';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.legal_document_versions (document_type, version, title, content, effective_at, published_at)
      VALUES ('terms', '__test_legal_duplicate_effective', 'Terms', '# Duplicate', '1900-01-02Z', now());
    RAISE EXCEPTION 'FAIL: duplicate published effective time allowed';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.legal_document_versions (document_type, version, title, content, effective_at)
      VALUES ('other', '__test_legal_invalid_type', 'Terms', '# Invalid', now());
    RAISE EXCEPTION 'FAIL: invalid document type allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.legal_document_versions (document_type, version, title, content, effective_at)
      VALUES ('terms', '__test_legal_empty', 'Terms', E' \n\t', now());
    RAISE EXCEPTION 'FAIL: whitespace content allowed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  UPDATE public.legal_document_versions SET content = '# Edited draft'
    WHERE version = '__test_legal_draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: draft update missing'; END IF;
  DELETE FROM public.legal_document_versions WHERE version = '__test_legal_draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: draft delete missing'; END IF;
END;
$$;

SET LOCAL ROLE anon;

DO $$
DECLARE
  visible_count INTEGER;
BEGIN
  SELECT count(*) INTO visible_count FROM public.legal_document_versions
    WHERE version LIKE '__test_legal_%';
  IF visible_count <> 3 THEN RAISE EXCEPTION 'FAIL: anonymous visibility: %', visible_count; END IF;
  IF EXISTS (
    SELECT 1 FROM public.legal_document_versions WHERE version = '__test_legal_hidden_draft'
  ) THEN RAISE EXCEPTION 'FAIL: draft visible'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.legal_document_versions
      WHERE version IN ('__test_legal_future_effective', '__test_legal_future_published')
  ) THEN RAISE EXCEPTION 'FAIL: future version visible'; END IF;
  BEGIN
    INSERT INTO public.legal_document_versions (document_type, version, title, content, effective_at)
      VALUES ('terms', '__test_legal_unauthorized', 'Terms', '# Unauthorized', now());
    RAISE EXCEPTION 'FAIL: anonymous write allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

RESET ROLE;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  visible_count INTEGER;
BEGIN
  SELECT count(*) INTO visible_count FROM public.legal_document_versions
    WHERE version LIKE '__test_legal_%';
  IF visible_count <> 3 THEN RAISE EXCEPTION 'FAIL: authenticated visibility: %', visible_count; END IF;
  BEGIN
    UPDATE public.legal_document_versions SET title = 'Unauthorized'
      WHERE version = '__test_legal_old';
    RAISE EXCEPTION 'FAIL: authenticated write allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;

RESET ROLE;
SET LOCAL ROLE service_role;

DO $$
BEGIN
  UPDATE public.legal_document_versions SET content = '# Service-role draft edit'
    WHERE version = '__test_legal_hidden_draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: service-role cannot manage drafts'; END IF;
  UPDATE public.legal_document_versions SET published_at = now()
    WHERE version = '__test_legal_hidden_draft';
  BEGIN
    UPDATE public.legal_document_versions SET content = '# Service-role published edit'
      WHERE version = '__test_legal_hidden_draft';
    RAISE EXCEPTION 'FAIL: service-role published update allowed';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
  BEGIN
    DELETE FROM public.legal_document_versions WHERE version = '__test_legal_hidden_draft';
    RAISE EXCEPTION 'FAIL: service-role published delete allowed';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;
END;
$$;

RESET ROLE;
ROLLBACK;
