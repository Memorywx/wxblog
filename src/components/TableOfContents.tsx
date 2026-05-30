'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const elements = document.querySelectorAll('.prose-custom h2, .prose-custom h3')
    const items: Heading[] = []
    elements.forEach((el) => {
      const id = el.id || el.textContent?.replace(/\s+/g, '-').toLowerCase() || ''
      if (!el.id) el.id = id
      items.push({ id, text: el.textContent || '', level: el.tagName === 'H2' ? 2 : 3 })
    })
    setHeadings(items)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -40% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#86868b] mb-4">
        目录
      </h3>
      <nav className="space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={cn(
              'block py-1.5 text-sm transition-colors duration-200 border-l-2 border-transparent pl-3',
              h.level === 3 && 'pl-5',
              activeId === h.id
                ? 'text-[#0071e3] border-[#0071e3] font-medium'
                : 'text-[#86868b] hover:text-[#0071e3]'
            )}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
