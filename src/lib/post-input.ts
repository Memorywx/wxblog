export interface NormalizedPostInput {
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover: string | null
  published: boolean
  tagNames: string[]
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toOptionalString(value: unknown) {
  const text = toTrimmedString(value)
  return text || null
}

export function normalizePostInput(body: unknown): NormalizedPostInput {
  const payload = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}

  return {
    title: toTrimmedString(payload.title),
    slug: toTrimmedString(payload.slug),
    content: typeof payload.content === 'string' ? payload.content.trim() : '',
    excerpt: toOptionalString(payload.excerpt),
    cover: toOptionalString(payload.cover),
    published: Boolean(payload.published),
    tagNames: [...new Set(Array.isArray(payload.tagNames)
      ? payload.tagNames.map((name) => toTrimmedString(name)).filter(Boolean)
      : [])],
  }
}

export function hasRequiredPostFields(input: NormalizedPostInput) {
  return Boolean(input.title && input.slug && input.content)
}
