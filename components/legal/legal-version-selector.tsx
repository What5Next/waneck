'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

import {
  LEGAL_DOCUMENTS,
  formatLegalDocumentDate,
  legalDocumentVersionHref,
  type LegalDocumentType,
  type LegalDocumentVersionSummary,
} from '@/lib/legal-documents'

export function LegalVersionSelector({
  type,
  versions,
  selectedVersion,
}: {
  type: LegalDocumentType
  versions: LegalDocumentVersionSummary[]
  selectedVersion: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2" aria-busy={isPending}>
      <label htmlFor="legal-document-version" className="text-sm font-medium">
        Document version
      </label>
      <select
        id="legal-document-version"
        value={selectedVersion}
        disabled={isPending}
        onChange={(event) => {
          const version = event.target.value
          startTransition(() => {
            router.push(version === versions[0].version
              ? LEGAL_DOCUMENTS[type].href
              : legalDocumentVersionHref(type, version))
          })
        }}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:w-auto sm:min-w-72"
      >
        {versions.map((item, index) => (
          <option key={item.id} value={item.version}>
            {item.version} — {formatLegalDocumentDate(item.effective_at)}{index === 0 ? ' (Current)' : ''}
          </option>
        ))}
      </select>
      <span className="sr-only" role="status">{isPending ? 'Loading document version…' : ''}</span>
    </div>
  )
}
