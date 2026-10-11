import Link from 'next/link'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import { ExplorePageLayout } from '@/components/layout/explore-page-layout'
import { LegalVersionSelector } from '@/components/legal/legal-version-selector'
import {
  LEGAL_DOCUMENTS,
  formatLegalDocumentDate,
  legalDocumentVersionHref,
  type LegalDocumentType,
} from '@/lib/legal-documents'
import { getLegalDocument } from '@/lib/legal-documents-server'

export type LegalDocumentSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

export async function LegalDocumentPage({
  type,
  searchParams,
}: {
  type: LegalDocumentType
  searchParams: LegalDocumentSearchParams
}) {
  const { version } = await searchParams
  if (Array.isArray(version)) notFound()

  const config = LEGAL_DOCUMENTS[type]
  const { versions, document } = await getLegalDocument(type, version)
  if (version !== undefined && !document) notFound()
  const isCurrent = document?.id === versions[0]?.id

  return (
    <ExplorePageLayout>
      <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 space-y-5 border-b border-border pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{document?.title ?? config.title}</h1>
          {document ? (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span>Version {document.version}</span>
                <span>Effective: <time dateTime={document.effective_at}>{formatLegalDocumentDate(document.effective_at)} (UTC)</time></span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {isCurrent ? 'Current version' : 'Previous version'}
                </span>
              </div>
              <LegalVersionSelector type={type} versions={versions} selectedVersion={document.version} />
              <Link href={legalDocumentVersionHref(type, document.version)} className="inline-block text-sm text-primary underline underline-offset-4">
                Link to this version
              </Link>
            </>
          ) : null}
        </header>

        {document ? (
          <>
            {!isCurrent ? (
              <aside className="mb-8 rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed">
                You are viewing a previous version of this document.{' '}
                <Link href={config.href} className="text-primary underline underline-offset-4">View the current version</Link>.
              </aside>
            ) : null}
            <div className="break-words text-base leading-7 text-foreground [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mb-2 [&_h4]:mt-5 [&_h4]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_hr]:my-8 [&_hr]:border-border [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-sm">
              <Markdown rehypePlugins={[rehypeSanitize]}>{document.content}</Markdown>
            </div>
          </>
        ) : (
          <p role="status" className="py-8 text-muted-foreground">
            This document is not available yet. Please check back later.
          </p>
        )}
      </article>
    </ExplorePageLayout>
  )
}
