import Link from 'next/link'
import { FileText, StickyNote, ArrowRight, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [latestPosts, latestShuos, totalStats] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tags: true },
    }),
    prisma.shuo.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.post.aggregate({
      where: { published: true },
      _count: { id: true },
    }),
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 max-w-[1100px] mx-auto">
      {/* 左侧：作者信息 */}
      <aside className="order-1 lg:order-1">
        <div className="glass-card p-6 text-center sticky top-24">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/40 shadow-sm">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=wxblog"
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-4">wxblog</h1>
          <p className="text-xs text-[#86868b] mt-1">全栈开发者 / 摄影爱好者</p>
          <p className="text-sm text-[#6e6e73] mt-3 leading-relaxed">
            热爱生活，喜欢代码与光影的交织。在这里记录技术成长与日常点滴。
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <div className="glass px-4 py-2 rounded-xl text-center min-w-[70px]">
              <div className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{totalStats._count.id}</div>
              <div className="text-[11px] text-[#86868b]">文章</div>
            </div>
            <div className="glass px-4 py-2 rounded-xl text-center min-w-[70px]">
              <div className="text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{latestShuos.length}</div>
              <div className="text-[11px] text-[#86868b]">说说</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 右侧：大毛玻璃块（85%） */}
      <div className="order-2 lg:order-2">
        <div className="glass-card p-8 md:p-10 space-y-14">
          {/* 最新文章 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FileText size={18} className="text-[#0071e3]" />
                最新文章
              </h2>
              <Link href="/posts" className="text-sm text-[#0071e3] hover:opacity-70 transition-opacity flex items-center gap-1">
                全部 <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.slug}`}>
                  <article className="glass p-4 rounded-2xl flex gap-4 group cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
                    {post.cover && (
                      <div className="hidden sm:block w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-black/5">
                        <img
                          src={post.cover}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors duration-200 line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-[#86868b] mt-1.5 line-clamp-2 leading-relaxed">
                          {post.excerpt || post.content.slice(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[#86868b]">
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} /> {post.views}
                        </span>
                        {post.tags.length > 0 && (
                          <span className="glass px-2 py-0.5 rounded-full">{post.tags[0].name}</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* 最新说说 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <StickyNote size={18} className="text-[#ff9500]" />
                最新说说
              </h2>
              <Link href="/shuos" className="text-sm text-[#0071e3] hover:opacity-70 transition-opacity flex items-center gap-1">
                全部 <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {latestShuos.map((shuo) => {
                const images = shuo.images ? JSON.parse(shuo.images) : []
                return (
                  <div key={shuo.id} className="glass p-4 rounded-2xl relative">
                    <div
                      className="absolute top-0 left-4 right-4 h-1 rounded-full"
                      style={{ backgroundColor: shuo.color }}
                    />
                    <p className="text-sm text-[#424245] dark:text-[#a1a1a6] mt-3 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {shuo.content}
                    </p>
                    {images.length > 0 && (
                      <div className="flex gap-1.5 mt-3">
                        {images.slice(0, 3).map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="" className="w-8 h-8 rounded-lg object-cover border border-black/5" />
                        ))}
                      </div>
                    )}
                    <span className="text-[11px] text-[#86868b] mt-3 block">{formatDate(shuo.createdAt)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
