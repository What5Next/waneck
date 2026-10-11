import Link from 'next/link'

import { ExplorePageLayout } from '@/components/layout/explore-page-layout'
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents'

export default function LegalDocumentNotFound() {
  return (
    <ExplorePageLayout>
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-12 sm:px-8">
        <h1 className="text-2xl font-semibold">Document version not found</h1>
        <p className="text-muted-foreground">This version is not available. View a current document below.</p>
        <nav aria-label="Current legal documents" className="flex flex-wrap gap-4">
          {Object.values(LEGAL_DOCUMENTS).map((document) => (
            <Link key={document.href} href={document.href} className="text-primary underline underline-offset-4">{document.title}</Link>
          ))}
        </nav>
      </div>
    </ExplorePageLayout>
  )
}
