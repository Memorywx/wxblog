'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, CheckCircle } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { getAdminPath } from '@/lib/admin-path'

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get('slug')

  const [token, setToken] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [cover, setCover] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (!t) {
      router.push(`/${getAdminPath()}`)
      return
    }
    setToken(t)

    if (editSlug) {
      setLoading(true)
      fetch(`/api/posts/${editSlug}`)
        .then((r) => r.json())
        .then((data) => {
          setTitle(data.title || '')
          setSlug(data.slug || '')
          setCover(data.cover || '')
          setExcerpt(data.excerpt || '')
          setTags(data.tags?.map((t: any) => t.name).join(', ') || '')
          setContent(data.content || '')
          setPublished(data.published ?? true)
          setLoading(false)
        })
    }
  }, [editSlug, router])

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!title.trim() || !slug.trim() || !content.trim()) return
    setSaving(true)
    setSaved(false)

    const data = {
      title,
      slug,
      content,
      excerpt,
      cover,
      published,
      tagNames: tags.split(',').map((s) => s.trim()).filter(Boolean),
    }

    const url = editSlug ? `/api/posts/${editSlug}` : '/api/posts'
    const method = editSlug ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (!editSlug) {
        setTitle('')
        setSlug('')
        setExcerpt('')
        setTags('')
        setContent('')
        setCover('')
        setPublished(true)
      }
    }
    setSaving(false)
  }

  // Ctrl+S 保存
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [title, slug, content, excerpt, cover, published, tags, token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10 animate-pulse">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="glass-nav h-14 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href={`/${getAdminPath()}/dashboard?tab=posts`} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6e6e73] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {editSlug ? '编辑文章' : '新建文章'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-[#34c759] px-3 py-1.5 rounded-full bg-[#34c759]/10">
              <CheckCircle size={13} /> 已保存
            </span>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-all shadow-md shadow-blue-500/15"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* Editor body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Meta + Editor */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Meta fields */}
          <div className="p-4 space-y-3 border-b border-black/5 dark:border-white/5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题 *"
              className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="链接标识 *"
                className="px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              />
              <input
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="封面图 URL"
                className="px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              />
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="标签，逗号分隔"
                className="px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="文章摘要"
                className="flex-1 px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-[#86868b] whitespace-nowrap cursor-pointer select-none">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
                立即发布
              </label>
            </div>
          </div>

          {/* Markdown textarea */}
          <div className="flex-1 p-4 min-h-0">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# 在这里编写 Markdown..."
              className="w-full h-full min-h-[60vh] px-4 py-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 font-mono text-sm resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="hidden lg:flex w-[45%] flex-col border-l border-black/5 dark:border-white/5">
          <div className="h-10 flex items-center px-4 border-b border-black/5 dark:border-white/5 text-xs text-[#86868b] font-medium uppercase tracking-wider">
            <Eye size={13} className="mr-1.5" /> 实时预览
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {content.trim() ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-sm text-[#86868b] italic">预览区域</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-10">加载中...</div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}
