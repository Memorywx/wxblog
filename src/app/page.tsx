import Link from 'next/link'
import { FileText, ArrowRight, Eye, Sparkles, MessageCircle, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [latestPosts, postsCount, shuosCount, totalViews] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { tags: true },
    }),
    prisma.post.count({ where: { published: true } }),
    prisma.shuo.count(),
    prisma.post.aggregate({ where: { published: true }, _sum: { views: true } }),
  ])

  return (
    <div className="max-w-[980px] mx-auto">
      <div className="glass-card p-5 sm:p-6 md:p-8 space-y-4">
        <section className="rounded-[28px] border border-black/5 bg-white/20 p-6 md:p-7 dark:border-white/8 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/40 shadow-sm shrink-0">
                <img
                  src="/avatar.jpg"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-[#0071e3] uppercase">
                  <Sparkles size={12} /> 持续更新
                </span>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">臭老头</h1>
                <p className="text-xs text-[#86868b] mt-1">全栈开发者</p>
                <p className="text-sm md:text-[15px] text-[#6e6e73] dark:text-[#a1a1a6] mt-3 leading-7 max-w-2xl">
                  随心记录开发、灵感和日常观察。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:min-w-[320px]">
              <div className="rounded-2xl border border-black/5 bg-white/25 px-4 py-4 text-center dark:border-white/8 dark:bg-white/[0.045]">
                <div className="flex items-center justify-center gap-2 text-xs text-[#86868b]"><FileText size={13} /> 文章</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{postsCount}</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white/25 px-4 py-4 text-center dark:border-white/8 dark:bg-white/[0.045]">
                <div className="flex items-center justify-center gap-2 text-xs text-[#86868b]"><MessageCircle size={13} /> 说说</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{shuosCount}</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white/25 px-4 py-4 text-center dark:border-white/8 dark:bg-white/[0.045]">
                <div className="flex items-center justify-center gap-2 text-xs text-[#86868b]"><TrendingUp size={13} /> 阅读</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{totalViews._sum.views || 0}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/5 bg-white/16 p-6 md:p-7 dark:border-white/8 dark:bg-white/[0.035]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <FileText size={18} className="text-[#0071e3]" />
                最新文章
              </h2>
              <Link href="/posts" className="text-sm text-[#0071e3] hover:opacity-70 transition-opacity flex items-center gap-1">
                全部 <ArrowRight size={14} />
              </Link>
            </div>
            {latestPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/8 bg-white/18 px-5 py-10 text-center text-sm text-[#86868b] dark:border-white/10 dark:bg-white/[0.03]">暂时还没有已发布文章。</div>
            ) : (
              <div className="space-y-3">
                {latestPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`}>
                    <article className="group flex gap-4 rounded-2xl border border-black/5 bg-white/20 p-4 transition-colors hover:bg-white/30 dark:border-white/8 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
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
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#86868b]">
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={11} /> {post.views}
                          </span>
                          {post.tags.length > 0 && (
                            <span className="rounded-full bg-black/[0.04] px-2 py-0.5 dark:bg-white/[0.06]">{post.tags[0].name}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
