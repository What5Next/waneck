import 'server-only'

import type { Tables } from '@/lib/database.types'
import type { LegalDocumentType, LegalDocumentVersionSummary } from '@/lib/legal-documents'
import { createClient } from '@/lib/supabase/server'

export type LegalDocumentResult = {
  versions: LegalDocumentVersionSummary[]
  document: Tables<'legal_document_versions'> | null
}

export async function getLegalDocument(
  type: LegalDocumentType,
  requestedVersion?: string,
): Promise<LegalDocumentResult> {
  // Use the user's/anonymous credentials so RLS also protects draft content.
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data: versions, error: versionsError } = await supabase
    .from('legal_document_versions')
    .select('id, version, effective_at')
    .eq('document_type', type)
    .lte('published_at', now)
    .lte('effective_at', now)
    .order('effective_at', { ascending: false })

  if (versionsError) {
    console.error('[legal-documents] Failed to load versions', versionsError)
    throw new Error('Unable to load legal document versions.')
  }

  const selected = requestedVersion === undefined
    ? versions[0]
    : versions.find((item) => item.version === requestedVersion)

  if (!selected) return { versions, document: null }

  const { data: document, error: documentError } = await supabase
    .from('legal_document_versions')
    .select('*')
    .eq('document_type', type)
    .eq('id', selected.id)
    .lte('published_at', now)
    .lte('effective_at', now)
    .maybeSingle()

  if (documentError) {
    console.error('[legal-documents] Failed to load document', documentError)
    throw new Error('Unable to load legal document.')
  }

  return { versions, document }
}
