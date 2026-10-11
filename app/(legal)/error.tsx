'use client'

import { ExplorePageLayout } from '@/components/layout/explore-page-layout'
import { Button } from '@/components/ui/button'

export default function LegalDocumentError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <ExplorePageLayout>
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-12 sm:px-8" role="alert">
        <h1 className="text-2xl font-semibold">Unable to load this document</h1>
        <p className="text-muted-foreground">Please try again in a moment.</p>
        <Button variant="outline" onClick={unstable_retry}>Try again</Button>
      </div>
    </ExplorePageLayout>
  )
}
