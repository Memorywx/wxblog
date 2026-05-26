import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [postsCount, shuosCount, albumsCount, photosCount, commentsCount, totalViews] =
    await Promise.all([
      prisma.post.count(),
      prisma.shuo.count(),
      prisma.album.count(),
      prisma.photo.count(),
      prisma.comment.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
    ])

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { title: true, views: true, createdAt: true },
  })

  const postsByMonth = await prisma.post.groupBy({
    by: ['createdAt'],
    _count: { id: true },
  })

  const monthMap: Record<string, number> = {}
  postsByMonth.forEach((p) => {
    const key = p.createdAt.toISOString().slice(0, 7)
    monthMap[key] = (monthMap[key] || 0) + p._count.id
  })

  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)

  return NextResponse.json({
    postsCount,
    shuosCount,
    albumsCount,
    photosCount,
    commentsCount,
    totalViews: totalViews._sum.views || 0,
    recentPosts,
    monthly,
  })
}
