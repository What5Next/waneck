import type { Components } from 'react-markdown'
import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-muted-foreground/90 not-italic">*{children}*</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-0.5">{children}</li>,
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className="bg-muted/80 block overflow-x-auto rounded px-2 py-1 text-xs">
          {children}
        </code>
      )
    }
    return <code className="bg-muted/80 rounded px-1 py-0.5 text-xs">{children}</code>
  },
  pre: ({ children }) => <pre className="mb-2 overflow-x-auto last:mb-0">{children}</pre>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline-offset-2 hover:underline"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
}

export type AssistantMarkdownBodyProps = {
  text: string
}

export function AssistantMarkdownBody({ text }: AssistantMarkdownBodyProps) {
  if (text.trim().length === 0) return null

  return (
    <div className="text-sm">
      <Markdown rehypePlugins={[rehypeSanitize]} components={markdownComponents}>
        {text}
      </Markdown>
    </div>
  )
}
