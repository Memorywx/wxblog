import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKC')
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/gi, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateShortSlug(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  const values = typeof crypto !== 'undefined' && 'getRandomValues' in crypto
    ? crypto.getRandomValues(new Uint32Array(length))
    : Uint32Array.from({ length }, () => Math.floor(Math.random() * chars.length))

  let result = ''

  for (const value of values) {
    result += chars[value % chars.length]
  }

  return result
}
