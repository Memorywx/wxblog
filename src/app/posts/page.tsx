'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { FileText, Eye, ArrowRight } from 'lucide-react'
import { fetcher } from '@/lib/fetcher'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover: string | null
  views: number
  createdAt: string
  tags: { name: string }[]
}

export default function PostsPage() {
  const { data: posts } = useSWR<Post[]>('/api/posts', fetcher, {
    refreshInterval: 30000,
  })

  if (!posts) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-6 h-40 animate-pulse bg-white/10" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">文章</h1>
        <p className="text-[#86868b] mt-2">共 {posts.length} 篇文章</p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.slug}`}>
            <article className="glass-card p-6 flex gap-6 group cursor-pointer">
              {post.cover && (
                <div className="hidden sm:block w-52 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-black/5">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors duration-200">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#86868b] mt-3 line-clamp-2 leading-relaxed">
                    {post.excerpt || post.content.slice(0, 150)}...
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-xs text-[#86868b]">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {post.views}
                    </span>
                    {post.tags.map((t) => (
                      <span key={t.name} className="glass px-2 py-0.5 rounded-full text-[11px]">
                        {t.name}
                      </span>
                    ))}
                  </div>
                  <ArrowRight size={16} className="text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
