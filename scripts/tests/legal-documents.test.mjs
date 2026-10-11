import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = new URL('../../', import.meta.url)

// Compile the real modules with only their framework/DB boundaries replaced.
function loadModule(path, dependencies = {}, logger = console) {
  const source = readFileSync(new URL(path, root), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  })
  const compiledModule = { exports: {} }
  const moduleRequire = (name) => Object.hasOwn(dependencies, name) ? dependencies[name] : require(name)
  new Function('require', 'module', 'exports', 'console', outputText)(moduleRequire, compiledModule, compiledModule.exports, logger)
  return compiledModule.exports
}

const config = loadModule('lib/legal-documents.ts')
const versions = [
  { id: 'current', version: '2.0', effective_at: '2026-02-01T00:00:00Z' },
  { id: 'previous', version: '1.0 / original', effective_at: '2026-01-01T00:00:00Z' },
]
const currentDocument = {
  ...versions[0], document_type: 'terms', title: 'Terms of Service',
  content: '## Current terms\n\nCurrent content.',
}

function mockServer({ list = versions, listError = null, document = currentDocument, documentError = null } = {}) {
  const queries = []
  const logs = []
  const supabase = {
    from(table) {
      const calls = [['from', table]]
      queries.push(calls)
      const query = {
        select(...args) { calls.push(['select', ...args]); return query },
        eq(...args) { calls.push(['eq', ...args]); return query },
        lte(...args) { calls.push(['lte', ...args]); return query },
        async order(...args) { calls.push(['order', ...args]); return { data: list, error: listError } },
        async maybeSingle() { calls.push(['maybeSingle']); return { data: document, error: documentError } },
      }
      return query
    },
  }
  const server = loadModule('lib/legal-documents-server.ts', {
    'server-only': {},
    '@/lib/supabase/server': { createClient: async () => supabase },
  }, { error: (...args) => logs.push(args) })
  return { ...server, queries, logs }
}

test('version links preserve special characters and use the correct document route', () => {
  for (const type of ['terms', 'privacy']) {
    const href = config.legalDocumentVersionHref(type, '1.0 / original + & # 한글')
    const url = new URL(href, 'https://example.com')
    assert.equal(url.pathname, config.LEGAL_DOCUMENTS[type].href)
    assert.equal(url.searchParams.get('version'), '1.0 / original + & # 한글')
  }
})

test('dates consistently display UTC instead of the host timezone', () => {
  assert.equal(config.formatLegalDocumentDate('2026-10-11T00:00:00+09:00'), 'October 10, 2026')
})

test('default read selects the newest effective version and filters both queries by type and visibility', async () => {
  const server = mockServer()
  const result = await server.getLegalDocument('terms')
  assert.equal(result.document.id, 'current')
  assert.deepEqual(result.versions, versions)
  assert.deepEqual(server.queries[0].at(-1), ['order', 'effective_at', { ascending: false }])
  assert.ok(server.queries[1].some((call) => call[0] === 'eq' && call[1] === 'id' && call[2] === 'current'))
  const cutoffs = []
  for (const calls of server.queries) {
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'document_type' && call[2] === 'terms'))
    for (const column of ['published_at', 'effective_at']) {
      const filter = calls.find((call) => call[0] === 'lte' && call[1] === column)
      assert.ok(filter)
      cutoffs.push(filter[2])
    }
  }
  assert.equal(new Set(cutoffs).size, 1)
})

test('explicit version reads the matching historical document, including special characters', async () => {
  const document = { ...currentDocument, ...versions[1] }
  const server = mockServer({ document })
  const result = await server.getLegalDocument('terms', '1.0 / original')
  assert.equal(result.document.id, 'previous')
  assert.ok(server.queries[1].some((call) => call[0] === 'eq' && call[1] === 'id' && call[2] === 'previous'))
})

test('unknown, empty and unavailable versions never fall back to the current body', async () => {
  for (const version of ['missing', '', 'draft', 'future']) {
    const server = mockServer()
    assert.equal((await server.getLegalDocument('terms', version)).document, null)
    assert.equal(server.queries.length, 1)
  }
  const empty = mockServer({ list: [] })
  assert.deepEqual(await empty.getLegalDocument('privacy'), { document: null, versions: [] })
})

test('privacy queries are scoped to privacy documents', async () => {
  const server = mockServer()
  await server.getLegalDocument('privacy')
  for (const calls of server.queries) {
    assert.ok(calls.some((call) => call[0] === 'eq' && call[1] === 'document_type' && call[2] === 'privacy'))
  }
})

test('database failures propagate as errors rather than empty or missing documents', async () => {
  const listFailure = mockServer({ list: null, listError: { message: 'Unavailable' } })
  await assert.rejects(listFailure.getLegalDocument('terms'), /Unable to load legal document versions/)
  assert.equal(listFailure.logs.length, 1)
  const documentFailure = mockServer({ document: null, documentError: { message: 'Unavailable' } })
  await assert.rejects(documentFailure.getLegalDocument('terms'), /Unable to load legal document\./)
  assert.equal(documentFailure.logs.length, 1)
})

const notFoundError = new Error('NOT_FOUND')
const selector = loadModule('components/legal/legal-version-selector.tsx', {
  '@/lib/legal-documents': config,
  'next/navigation': { useRouter: () => ({ push() {} }) },
})

function mockPage(result) {
  const reads = []
  const page = loadModule('components/legal/legal-document-page.tsx', {
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    'next/navigation': { notFound() { throw notFoundError } },
    '@/components/layout/explore-page-layout': { ExplorePageLayout: ({ children }) => React.createElement('div', {}, children) },
    '@/components/legal/legal-version-selector': selector,
    '@/lib/legal-documents': config,
    '@/lib/legal-documents-server': { getLegalDocument: async (...args) => { reads.push(args); return result } },
  })
  return { ...page, reads }
}

test('current page renders semantic Markdown, current badge, accessible selector and fixed version link', async () => {
  const page = mockPage({ document: currentDocument, versions })
  const html = renderToStaticMarkup(await page.LegalDocumentPage({ type: 'terms', searchParams: Promise.resolve({}) }))
  assert.match(html, /<h2>Current terms<\/h2>/)
  assert.match(html, /Current version/)
  assert.match(html, /<label[^>]*for="legal-document-version"[^>]*>Document version<\/label>/)
  assert.match(html, /href="\/policy\?version=2.0"/)
  assert.match(html, /<option value="2.0" selected=""/)
})

test('previous page renders historical warning and strips executable Markdown content', async () => {
  const document = { ...currentDocument, ...versions[1], content: '## Previous terms\n\n[Unsafe](javascript:alert(1))\n\n<script>alert(1)</script>' }
  const page = mockPage({ document, versions })
  const html = renderToStaticMarkup(await page.LegalDocumentPage({ type: 'terms', searchParams: Promise.resolve({ version: document.version }) }))
  assert.match(html, /Previous version/)
  assert.match(html, /View the current version/)
  assert.match(html, /href="\/policy"/)
  assert.doesNotMatch(html, /<script|href="javascript:/)
  assert.match(html, /version=1.0\+%2F\+original/)
})

test('unregistered policy shows its title and empty notice without a selector', async () => {
  const page = mockPage({ document: null, versions: [] })
  const html = renderToStaticMarkup(await page.LegalDocumentPage({ type: 'privacy', searchParams: Promise.resolve({}) }))
  assert.match(html, /Privacy Policy/)
  assert.match(html, /This document is not available yet/)
  assert.doesNotMatch(html, /<select/)
})

test('explicit unavailable and repeated version parameters raise notFound', async () => {
  const page = mockPage({ document: null, versions: [] })
  await assert.rejects(page.LegalDocumentPage({ type: 'terms', searchParams: Promise.resolve({ version: 'missing' }) }), (error) => error === notFoundError)
  const repeated = mockPage({ document: currentDocument, versions })
  await assert.rejects(repeated.LegalDocumentPage({ type: 'terms', searchParams: Promise.resolve({ version: ['1.0', '2.0'] }) }), (error) => error === notFoundError)
  assert.equal(repeated.reads.length, 0)
})

test('version selector navigates to encoded historical links and the base URL for current', () => {
  const destinations = []
  const { LegalVersionSelector } = loadModule('components/legal/legal-version-selector.tsx', {
    react: { ...React, useTransition: () => [false, (callback) => callback()] },
    '@/lib/legal-documents': config,
    'next/navigation': { useRouter: () => ({ push: (href) => destinations.push(href) }) },
  })
  for (const type of ['terms', 'privacy']) {
    const element = LegalVersionSelector({ type, versions, selectedVersion: versions[0].version })
    const select = element.props.children.find((child) => child.type === 'select')
    select.props.onChange({ target: { value: versions[1].version } })
    select.props.onChange({ target: { value: versions[0].version } })
    assert.equal(destinations.at(-2), config.legalDocumentVersionHref(type, versions[1].version))
    assert.equal(destinations.at(-1), config.LEGAL_DOCUMENTS[type].href)
  }
})
