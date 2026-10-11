import { LegalDocumentPage, type LegalDocumentSearchParams } from '@/components/legal/legal-document-page'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'

export const metadata = {
  title: 'Privacy Policy | whatsnext',
  description: LEGAL_DOCUMENTS.privacy.description,
}

export default function PrivacyPolicyPage({ searchParams }: { searchParams: LegalDocumentSearchParams }) {
  return <LegalDocumentPage type="privacy" searchParams={searchParams} />
}
