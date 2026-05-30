'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, CheckCircle, RotateCcw } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { getAdminPath } from '@/lib/admin-path'
import { generateShortSlug } from '@/lib/utils'

interface EditorPost {
  title: string
  slug: string
  cover: string | null
  excerpt: string | null
  content: string
  published: boolean
  tags: { name: string }[]
}

interface LocalDraft {
  title: string
  slug: string
  cover: string
  excerpt: string
  tags: string
  content: string
  published: boolean
  slugEdited: boolean
}

function isEditorPost(data: EditorPost | { error?: string }): data is EditorPost {
  return 'title' in data && 'slug' in data && 'content' in data && Array.isArray(data.tags)
}

function getDraftKey(editSlug: string | null) {
  return `editor_draft:${editSlug || 'new'}`
}

function parseTagNames(value: string) {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]
}

function hasDraftContent(draft: LocalDraft) {
  return Boolean(draft.title || draft.slug || draft.cover || draft.excerpt || draft.tags || draft.content)
}

async function getErrorMessage(res: Response) {
  try {
    const data = await res.json() as { error?: string }
    if (data.error === 'Unauthorized') return '登录状态已失效，请重新登录后再保存。'
    if (data.error === 'Slug already exists') return '当前链接标识已存在，请更换后再保存。'
    if (data.error === 'Missing required fields') return '标题、链接标识和正文不能为空。'
    return data.error || '保存失败，请稍后重试。'
  } catch {
    return '保存失败，请稍后重试。'
  }
}

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get('slug')
  const adminPath = getAdminPath()
  const draftKey = getDraftKey(editSlug)

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
  const [error, setError] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [slugEdited, setSlugEdited] = useState(Boolean(editSlug))
  const [pendingDraft, setPendingDraft] = useState<LocalDraft | null>(null)
  const [draftResolved, setDraftResolved] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')

  const selectedTags = parseTagNames(tags)

  function applyDraft(draft: LocalDraft) {
    setTitle(draft.title)
    setSlug(draft.slug)
    setCover(draft.cover)
    setExcerpt(draft.excerpt)
    setTags(draft.tags)
    setContent(draft.content)
    setPublished(draft.published)
    setSlugEdited(draft.slugEdited)
  }

  function toggleTag(tagName: string) {
    const next = selectedTags.includes(tagName)
      ? selectedTags.filter((item) => item !== tagName)
      : [...selectedTags, tagName]

    setTags(next.join(', '))
  }

  function regenerateSlug() {
    setSlug(generateShortSlug())
    setSlugEdited(true)
  }

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle)
  }

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey)
    let resolved = !savedDraft

    if (savedDraft) {
      try {
        setPendingDraft(JSON.parse(savedDraft) as LocalDraft)
      } catch {
        localStorage.removeItem(draftKey)
        resolved = true
      }
    }
    setDraftResolved(resolved)

    const t = localStorage.getItem('admin_token')
    if (!t) {
      router.push(`/${adminPath}`)
      return
    }
    setToken(t)

    fetch('/api/tags')
      .then((r) => r.json())
      .then((data: string[]) => setAvailableTags(data))
      .catch(() => setAvailableTags([]))

    if (!editSlug && !savedDraft) {
      setSlug(generateShortSlug())
      setSlugEdited(true)
    }

    if (editSlug) {
      setLoading(true)
      fetch(`/api/posts/${editSlug}?view=false`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((data: EditorPost | { error?: string }) => {
          if (!isEditorPost(data)) {
            throw new Error(data.error || '加载文章失败')
          }

          setTitle(data.title || '')
          setSlug(data.slug || '')
          setCover(data.cover || '')
          setExcerpt(data.excerpt || '')
          setTags(data.tags.map((item) => item.name).join(', '))
          setContent(data.content || '')
          setPublished(data.published ?? true)
          setSlugEdited(true)
          setLoading(false)
        })
        .catch((err: Error) => {
          setError(err.message || '加载文章失败，请返回列表重试。')
          setLoading(false)
        })
    }
  }, [adminPath, draftKey, editSlug, router])

  useEffect(() => {
    if (!draftResolved) return

    const draft: LocalDraft = {
      title,
      slug,
      cover,
      excerpt,
      tags,
      content,
      published,
      slugEdited,
    }

    if (!hasDraftContent(draft)) {
      localStorage.removeItem(draftKey)
      return
    }

    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(draft))
      setDraftMessage('草稿已自动保存到本地')
    }, 700)

    return () => window.clearTimeout(timer)
  }, [content, cover, draftKey, draftResolved, excerpt, published, slug, slugEdited, tags, title])

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError('标题、链接标识和正文不能为空。')
      return
    }

    if (!token) {
      setError('登录状态已失效，请重新登录后再保存。')
      return
    }

    setSaving(true)
    setSaved(false)
    setError('')

    const data = {
      title,
      slug,
      content,
      excerpt,
      cover,
      published,
      tagNames: parseTagNames(tags),
    }

    const url = editSlug ? `/api/posts/${editSlug}` : '/api/posts'
    const method = editSlug ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const savedPost = await res.json() as { slug: string }
        setSaved(true)
        localStorage.removeItem(draftKey)
        setPendingDraft(null)
        setDraftResolved(true)
        setDraftMessage('')
        setTimeout(() => setSaved(false), 2000)
        if (editSlug && savedPost.slug !== editSlug) {
          router.replace(`/${adminPath}/editor?slug=${savedPost.slug}`)
        } else if (!editSlug) {
          setTitle('')
          setSlug(generateShortSlug())
          setExcerpt('')
          setTags('')
          setContent('')
          setCover('')
          setPublished(true)
          setSlugEdited(false)
        }
      } else {
        setError(await getErrorMessage(res))
      }
    } catch {
      setError('网络异常，保存失败，请稍后重试。')
    }

    setSaving(false)
  }

  function restoreDraft() {
    if (!pendingDraft) return
    applyDraft(pendingDraft)
    setPendingDraft(null)
    setDraftResolved(true)
    setDraftMessage('已恢复本地草稿')
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    setPendingDraft(null)
    setDraftResolved(true)
    setDraftMessage('')
  }

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
      <header className="glass-nav h-14 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href={`/${adminPath}/dashboard?tab=posts`} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6e6e73] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {editSlug ? '编辑文章' : '新建文章'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {draftMessage && <span className="hidden lg:block text-xs text-[#86868b]">{draftMessage}</span>}
          {saved && (
            <span className="flex items-center gap-1 text-xs text-[#34c759] px-3 py-1.5 rounded-full bg-[#34c759]/10">
              <CheckCircle size={13} /> 已保存
            </span>
          )}
          {error && <span className="hidden sm:block text-xs text-[#ff3b30] max-w-72 truncate">{error}</span>}
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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="p-4 space-y-3 border-b border-black/5 dark:border-white/5">
            {error && <div className="sm:hidden text-sm text-[#ff3b30] rounded-xl bg-[#ff3b30]/10 px-4 py-3">{error}</div>}
            {pendingDraft && (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#0071e3]/15 bg-[#0071e3]/8 px-4 py-3 text-sm text-[#1d1d1f] dark:text-[#f5f5f7] sm:flex-row sm:items-center sm:justify-between">
                <div>检测到未保存的本地草稿，是否恢复？</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={restoreDraft} className="px-3 py-1.5 rounded-lg bg-[#0071e3] text-white text-xs font-medium">
                    恢复草稿
                  </button>
                  <button type="button" onClick={discardDraft} className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-xs text-[#86868b]">
                    忽略
                  </button>
                </div>
              </div>
            )}
            {draftMessage && <div className="lg:hidden text-xs text-[#86868b] px-1">{draftMessage}</div>}
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="文章标题 *"
              className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-1">
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setSlugEdited(true)
                  }}
                  placeholder="链接标识 *"
                  className="w-full min-w-0 px-4 py-2 pr-11 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
                />
                <button
                  type="button"
                  onClick={regenerateSlug}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors"
                  title="随机生成链接标识"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
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
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {availableTags.map((tagName) => {
                  const selected = selectedTags.includes(tagName)
                  return (
                    <button
                      key={tagName}
                      type="button"
                      onClick={() => toggleTag(tagName)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${selected ? 'bg-[#0071e3] text-white' : 'bg-black/5 dark:bg-white/5 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3]'}`}
                    >
                      {tagName}
                    </button>
                  )
                })}
              </div>
            )}
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
