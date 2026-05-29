'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  StickyNote,
  Image,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Eye,
  X,
  BarChart3,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getAdminPath } from '@/lib/admin-path'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

type Tab = 'overview' | 'posts' | 'shuos' | 'photos'

interface Stats {
  postsCount: number
  shuosCount: number
  albumsCount: number
  photosCount: number
  commentsCount: number
  totalViews: number
  recentPosts: { title: string; views: number; createdAt: string }[]
  monthly: [string, number][]
}

export default function DashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [shuos, setShuos] = useState<any[]>([])
  const [albums, setAlbums] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [shuoModal, setShuoModal] = useState(false)
  const [albumModal, setAlbumModal] = useState(false)
  const [photoModal, setPhotoModal] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    if (!t) {
      router.push(`/${getAdminPath()}`)
      return
    }
    setToken(t)
    loadAll(t)
  }, [router])

  async function loadAll(t?: string) {
    const auth = t || token
    const [statsRes, postsRes, shuosRes, albumsRes, photosRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/posts?published=false', {
        headers: auth ? { Authorization: `Bearer ${auth}` } : undefined,
      }),
      fetch('/api/shuos'),
      fetch('/api/albums'),
      fetch('/api/photos'),
    ])

    if (postsRes.status === 401) {
      localStorage.removeItem('admin_token')
      router.push(`/${getAdminPath()}`)
      return
    }

    setStats(await statsRes.json())
    setPosts(await postsRes.json())
    const shuosData = await shuosRes.json()
    setShuos(shuosData.map((s: any) => ({ ...s, images: s.images ? JSON.parse(s.images) : [] })))
    setAlbums(await albumsRes.json())
    setPhotos(await photosRes.json())
    setLoading(false)
  }

  function logout() {
    localStorage.removeItem('admin_token')
    router.push(`/${getAdminPath()}`)
  }

  async function deletePost(slug: string) {
    if (!confirm('确定删除这篇文章？')) return
    await fetch(`/api/posts/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadAll()
  }

  async function deleteShuo(id: string) {
    if (!confirm('确定删除这条说说？')) return
    await fetch(`/api/shuos?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadAll()
  }

  async function deleteAlbum(id: string) {
    if (!confirm('确定删除这个相册？')) return
    await fetch(`/api/albums?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadAll()
  }

  async function deletePhoto(id: string) {
    if (!confirm('确定删除这张照片？')) return
    await fetch(`/api/photos?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadAll()
  }

  async function saveShuo(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    const images = (fd.get('images') as string).split('\n').map((s) => s.trim()).filter(Boolean)
    await fetch('/api/shuos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        content: fd.get('content'),
        color: fd.get('color'),
        images,
      }),
    })
    setShuoModal(false)
    loadAll()
  }

  async function saveAlbum(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    await fetch('/api/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: fd.get('title'),
        description: fd.get('description'),
        cover: fd.get('cover'),
      }),
    })
    setAlbumModal(false)
    loadAll()
  }

  async function savePhoto(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        url: fd.get('url'),
        caption: fd.get('caption'),
        albumId: fd.get('albumId'),
      }),
    })
    setPhotoModal(false)
    loadAll()
  }

  const tabs = [
    { key: 'overview' as Tab, label: '概览', icon: LayoutDashboard },
    { key: 'posts' as Tab, label: '文章', icon: FileText },
    { key: 'shuos' as Tab, label: '说说', icon: StickyNote },
    { key: 'photos' as Tab, label: '照片', icon: Image },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card h-96 animate-pulse bg-white/10" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <div className="glass-card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="font-semibold text-base tracking-tight">管理后台</span>
              <button onClick={logout} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors" title="退出">
                <LogOut size={15} />
              </button>
            </div>
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === t.key
                      ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/15'
                      : 'text-[#6e6e73] dark:text-[#a1a1a6] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {tab === 'overview' && stats && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard icon={FileText} label="文章" value={stats.postsCount} color="text-[#0071e3]" />
                  <StatCard icon={MessageCircle} label="评论" value={stats.commentsCount} color="text-[#34c759]" />
                  <StatCard icon={TrendingUp} label="总阅读" value={stats.totalViews} color="text-[#af52de]" />
                  <StatCard icon={StickyNote} label="说说" value={stats.shuosCount} color="text-[#ff9500]" />
                  <StatCard icon={Image} label="相册" value={stats.albumsCount} color="text-[#ff2d55]" />
                  <StatCard icon={Image} label="照片" value={stats.photosCount} color="text-[#5ac8fa]" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm">
                      <BarChart3 size={16} className="text-[#0071e3]" />
                      文章月度统计
                    </h3>
                    <Bar
                      data={{
                        labels: stats.monthly.map(([m]) => m),
                        datasets: [{
                          label: '文章数',
                          data: stats.monthly.map(([, v]) => v),
                          backgroundColor: 'rgba(0, 113, 227, 0.7)',
                          borderColor: 'rgba(0, 113, 227, 1)',
                          borderWidth: 0,
                          borderRadius: 8,
                        }],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.04)' } },
                          x: { grid: { display: false } },
                        },
                      }}
                    />
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-5 flex items-center gap-2 text-sm">
                      <TrendingUp size={16} className="text-[#af52de]" />
                      内容分布
                    </h3>
                    <Doughnut
                      data={{
                        labels: ['文章', '说说', '照片'],
                        datasets: [{
                          data: [stats.postsCount, stats.shuosCount, stats.photosCount],
                          backgroundColor: ['rgba(0, 113, 227, 0.7)', 'rgba(255, 149, 0, 0.7)', 'rgba(255, 45, 85, 0.7)'],
                          borderColor: ['rgba(0, 113, 227, 1)', 'rgba(255, 149, 0, 1)', 'rgba(255, 45, 85, 1)'],
                          borderWidth: 0,
                        }],
                      }}
                      options={{ responsive: true, cutout: '65%' }}
                    />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 text-sm">最新文章</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#86868b] border-b border-black/5 dark:border-white/5">
                          <th className="pb-3 font-medium text-xs uppercase tracking-wider">标题</th>
                          <th className="pb-3 font-medium text-xs uppercase tracking-wider">阅读量</th>
                          <th className="pb-3 font-medium text-xs uppercase tracking-wider">发布时间</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {stats.recentPosts.map((post) => (
                          <tr key={post.title}>
                            <td className="py-3 text-[#1d1d1f] dark:text-[#f5f5f7]">{post.title}</td>
                            <td className="py-3">{post.views}</td>
                            <td className="py-3 text-[#86868b]">{formatDate(post.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'posts' && (
              <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">文章管理</h2>
                  <Link href={`/${getAdminPath()}/editor`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-all shadow-md shadow-blue-500/15">
                    <Plus size={14} /> 新建文章
                  </Link>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left bg-black/[0.02] dark:bg-white/[0.03]">
                          <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-[#86868b]">标题</th>
                          <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-[#86868b]">状态</th>
                          <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-[#86868b]">阅读</th>
                          <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-[#86868b]">时间</th>
                          <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-[#86868b] text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {posts.map((post) => (
                          <tr key={post.id}>
                            <td className="px-4 py-3 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{post.title}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${post.published ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#8e8e93]/10 text-[#8e8e93]'}`}>
                                {post.published ? '已发布' : '草稿'}
                              </span>
                            </td>
                            <td className="px-4 py-3">{post.views}</td>
                            <td className="px-4 py-3 text-[#86868b]">{formatDate(post.createdAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {post.published ? (
                                  <a href={`/posts/${post.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-[#0071e3]/10 text-[#0071e3] transition-colors">
                                    <Eye size={14} />
                                  </a>
                                ) : (
                                  <span title="草稿未公开" className="p-1.5 rounded-lg text-[#86868b]/70 cursor-not-allowed">
                                    <Eye size={14} />
                                  </span>
                                )}
                                <Link href={`/${getAdminPath()}/editor?slug=${post.slug}`} className="p-1.5 rounded-lg hover:bg-[#ff9500]/10 text-[#ff9500] transition-colors">
                                  <Edit3 size={14} />
                                </Link>
                                <button onClick={() => deletePost(post.slug)} className="p-1.5 rounded-lg hover:bg-[#ff2d55]/10 text-[#ff2d55] transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'shuos' && (
              <motion.div key="shuos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">说说管理</h2>
                  <button onClick={() => setShuoModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-all shadow-md shadow-blue-500/15">
                    <Plus size={14} /> 新建说说
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shuos.map((shuo) => (
                    <div key={shuo.id} className="glass-card p-4 relative group">
                      <button onClick={() => deleteShuo(shuo.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#ff2d55]/10 text-[#ff2d55] transition-all">
                        <Trash2 size={14} />
                      </button>
                      <div className="rounded-xl p-4 text-white mb-3" style={{ backgroundColor: shuo.color }}>
                        <p className="text-sm">{shuo.content}</p>
                      </div>
                      <span className="text-[11px] text-[#86868b]">{formatDate(shuo.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'photos' && (
              <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">照片管理</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setAlbumModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#af52de] text-white text-sm font-medium hover:bg-[#b75fd9] transition-all shadow-md shadow-purple-500/15">
                      <Plus size={14} /> 新建相册
                    </button>
                    <button onClick={() => setPhotoModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-all shadow-md shadow-blue-500/15">
                      <Plus size={14} /> 添加照片
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {albums.map((album) => (
                    <div key={album.id} className="glass-card overflow-hidden relative group">
                      <button onClick={() => deleteAlbum(album.id)}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#ff2d55]/10 text-[#ff2d55] transition-all bg-black/20">
                        <Trash2 size={14} />
                      </button>
                      <div className="h-32 overflow-hidden">
                        <img src={album.cover || 'https://picsum.photos/400/300'} alt={album.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{album.title}</h3>
                        <p className="text-sm text-[#86868b] mt-1">{album._count.photos} 张照片</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => deletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#ff2d55]/10 text-[#ff2d55] transition-all bg-black/30">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}

      {shuoModal && (
        <Modal title="新建说说" onClose={() => setShuoModal(false)}>
          <form onSubmit={saveShuo} className="space-y-4">
            <textarea name="content" placeholder="内容 *" rows={4} className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 resize-none text-sm" required />
            <input type="color" name="color" defaultValue="#ff9500" className="w-full h-10 rounded-xl" />
            <textarea name="images" placeholder="图片 URL，每行一个" rows={3} className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 resize-none font-mono text-sm" />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] transition-all">
              保存
            </button>
          </form>
        </Modal>
      )}

      {albumModal && (
        <Modal title="新建相册" onClose={() => setAlbumModal(false)}>
          <form onSubmit={saveAlbum} className="space-y-4">
            <input name="title" placeholder="相册名称 *" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" required />
            <input name="description" placeholder="描述" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" />
            <input name="cover" placeholder="封面图 URL" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] transition-all">
              保存
            </button>
          </form>
        </Modal>
      )}

      {photoModal && (
        <Modal title="添加照片" onClose={() => setPhotoModal(false)}>
          <form onSubmit={savePhoto} className="space-y-4">
            <input name="url" placeholder="图片 URL *" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" required />
            <input name="caption" placeholder="caption" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" />
            <select name="albumId" className="w-full px-4 py-2 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm" required>
              <option value="">选择相册 *</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white font-medium hover:bg-[#0077ed] transition-all">
              保存
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-[#86868b]">{label}</p>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[#86868b]">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  )
}
