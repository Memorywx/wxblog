import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const publishedOnly = searchParams.get('published') !== 'false'

  const posts = await prisma.post.findMany({
    where: publishedOnly ? { published: true } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { tags: true, _count: { select: { comments: true } } },
  })

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, content, excerpt, cover, published, tagNames } = body

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      cover,
      published: !!published,
      tags: {
        connectOrCreate: tagNames?.map((name: string) => ({
          where: { name },
          create: { name },
        })) || [],
      },
    },
  })

  return NextResponse.json(post)
}
