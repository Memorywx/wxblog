'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import TableOfContents from '@/components/TableOfContents'
import ReadingProgress from '@/components/ReadingProgress'
import CommentSection from '@/components/CommentSection'
import { formatDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  content: string
  cover: string | null
  views: number
  createdAt: string
  tags: { name: string }[]
  comments: { id: string; name: string; content: string; createdAt: string }[]
}

export default function PostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/posts/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-8 h-96 animate-pulse bg-white/10" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4">文章不存在</h1>
        <Link href="/posts" className="text-[#0071e3] hover:opacity-70 transition-opacity">
          返回文章列表
        </Link>
      </div>
    )
  }

  return (
    <>
      <ReadingProgress />
      <div className="max-w-5xl mx-auto">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-[#86868b] hover:text-[#0071e3] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          返回列表
        </Link>

        {post.cover && (
          <div className="rounded-3xl overflow-hidden mb-10 shadow-lg border border-black/5">
            <img src={post.cover} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_260px] gap-10">
          <article>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#86868b] mb-10 pb-6 border-b border-black/5 dark:border-white/5">
              <span className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-xs">
                <Calendar size={12} />
                {formatDate(post.createdAt)}
              </span>
              <span className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-xs">
                <Eye size={12} />
                {post.views} 阅读
              </span>
              {post.tags.map((t) => (
                <span key={t.name} className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-xs">
                  <Tag size={12} />
                  {t.name}
                </span>
              ))}
            </div>

            <MarkdownRenderer content={post.content} />

            <CommentSection
              postSlug={slug}
              comments={post.comments}
              onCommentAdded={(c) => setPost({ ...post, comments: [c, ...post.comments] })}
            />
          </article>

          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </>
  )
}
