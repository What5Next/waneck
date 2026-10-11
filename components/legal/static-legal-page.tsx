import { readFile } from 'node:fs/promises'
import path from 'node:path'

import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import { ExplorePageLayout } from '@/components/layout/explore-page-layout'

/** content/legal 아래의 Markdown 파일 이름 */
export type StaticLegalDocument = 'terms' | 'privacy' | 'refund'

async function readLegalMarkdown(name: StaticLegalDocument): Promise<string> {
  return readFile(path.join(process.cwd(), 'content', 'legal', `${name}.md`), 'utf8')
}

export async function StaticLegalPage({ name }: { name: StaticLegalDocument }) {
  const content = await readLegalMarkdown(name)

  return (
    <ExplorePageLayout>
      <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="break-words text-base leading-7 text-foreground [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold">
          <Markdown rehypePlugins={[rehypeSanitize]}>{content}</Markdown>
        </div>
      </article>
    </ExplorePageLayout>
  )
}
