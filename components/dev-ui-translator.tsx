'use client'

import { useEffect } from 'react'

import { DEV_LANGUAGE_SELECTOR_ENABLED, useDevLanguage } from '@/components/dev-language-provider'
import { devUiKoreanCopy } from '@/lib/dev-ui-copy'

const ATTRIBUTES = ['aria-label', 'placeholder', 'title'] as const
const originalText = new WeakMap<Text, string>()
const originalAttributes = new WeakMap<Element, Map<string, string>>()

function displayText(english: string): string {
  const match = english.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return match && devUiKoreanCopy[match[2]]
    ? match[1] + devUiKoreanCopy[match[2]] + match[3]
    : english
}

function shouldSkip(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return Boolean(element?.closest('[data-dev-language-ignore], [contenteditable="true"], pre, code, textarea'))
}

function translateText(node: Text, language: 'en' | 'ko') {
  if (shouldSkip(node)) return
  const current = node.nodeValue ?? ''
  const remembered = originalText.get(node)
  const previousTranslation = remembered ? displayText(remembered) : ''
  const english = remembered && (current === remembered || current === previousTranslation) ? remembered : current
  const match = english.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!match || !devUiKoreanCopy[match[2]]) return
  originalText.set(node, english)
  const next = language === 'ko' ? displayText(english) : english
  if (current !== next) node.nodeValue = next
}

function translateAttributes(element: Element, language: 'en' | 'ko') {
  if (shouldSkip(element)) return
  const remembered = originalAttributes.get(element) ?? new Map<string, string>()
  for (const name of ATTRIBUTES) {
    const current = element.getAttribute(name)
    if (!current) continue
    const previous = remembered.get(name)
    const english = previous && (current === previous || current === devUiKoreanCopy[previous]) ? previous : current
    if (!devUiKoreanCopy[english]) continue
    remembered.set(name, english)
    const next = language === 'ko' ? devUiKoreanCopy[english] : english
    if (current !== next) element.setAttribute(name, next)
  }
  originalAttributes.set(element, remembered)
}

function translateTree(root: Node, language: 'en' | 'ko') {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root as Text, language)
    return
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return
  const element = root as Element
  if (shouldSkip(element)) return
  translateAttributes(element, language)
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node.nodeType === Node.TEXT_NODE) translateText(node as Text, language)
    else translateAttributes(node as Element, language)
  }
}

/** Development-only translation aid for static labels across existing pages. */
export function DevUiTranslator() {
  const { language } = useDevLanguage()

  useEffect(() => {
    if (!DEV_LANGUAGE_SELECTOR_ENABLED) return
    translateTree(document.body, language)
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') translateTree(record.target, language)
        else if (record.type === 'attributes') translateTree(record.target, language)
        else for (const node of record.addedNodes) translateTree(node, language)
      }
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    })
    return () => observer.disconnect()
  }, [language])

  return null
}
