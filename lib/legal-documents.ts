export const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Terms of Service',
    href: '/policy',
    description: 'Terms governing your use of whatsnext.',
  },
  privacy: {
    title: 'Privacy Policy',
    href: '/privacy-policy',
    description: 'How whatsnext handles your personal information.',
  },
} as const

export type LegalDocumentType = keyof typeof LEGAL_DOCUMENTS

export type LegalDocumentVersionSummary = {
  id: string
  version: string
  effective_at: string
}

export function legalDocumentVersionHref(type: LegalDocumentType, version: string) {
  return `${LEGAL_DOCUMENTS[type].href}?${new URLSearchParams({ version })}`
}

export function formatLegalDocumentDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}
