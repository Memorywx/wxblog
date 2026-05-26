'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Comment {
  id: string
  name: string
  content: string
  createdAt: string
}

interface Props {
  postSlug: string
  comments: Comment[]
  onCommentAdded: (c: Comment) => void
}

export default function CommentSection({ postSlug, comments, onCommentAdded }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !content.trim()) return
    setSubmitting(true)

    const res = await fetch(`/api/posts/${postSlug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, content }),
    })

    if (res.ok) {
      const comment = await res.json()
      onCommentAdded(comment)
      setContent('')
    }
    setSubmitting(false)
  }

  return (
    <div className="glass-card p-6 mt-14">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
        <MessageCircle size={18} className="text-[#0071e3]" />
        评论区 ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="昵称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]"
            required
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]"
            required
          />
        </div>
        <textarea
          placeholder="写下你的评论..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm resize-none text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b]"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-all"
        >
          <Send size={14} />
          {submitting ? '提交中...' : '发表评论'}
        </button>
      </form>

      <div className="space-y-3">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 p-4 rounded-xl glass"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071e3] to-[#5856d6] flex items-center justify-center text-white flex-shrink-0 text-xs font-medium">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{comment.name}</span>
                  <span className="text-[11px] text-[#86868b]">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-[#424245] dark:text-[#a1a1a6] leading-relaxed">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
