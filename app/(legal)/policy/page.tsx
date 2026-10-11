import { LegalDocumentPage, type LegalDocumentSearchParams } from '@/components/legal/legal-document-page'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'

export const metadata = {
  title: 'Terms of Service | whatsnext',
  description: LEGAL_DOCUMENTS.terms.description,
}

export default function PolicyPage({ searchParams }: { searchParams: LegalDocumentSearchParams }) {
  return <LegalDocumentPage type="terms" searchParams={searchParams} />
}
