import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import { hasRequiredPostFields, normalizePostInput } from '@/lib/post-input'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includeDrafts = searchParams.get('published') === 'false'

  if (includeDrafts && !verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.post.findMany({
    where: includeDrafts ? undefined : { published: true },
    orderBy: { createdAt: 'desc' },
    include: { tags: true, _count: { select: { comments: true } } },
  })

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const input = normalizePostInput(body)

    if (!hasRequiredPostFields(input)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.post.findUnique({ where: { slug: input.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const post = await prisma.post.create({
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        cover: input.cover,
        published: input.published,
        tags: {
          connectOrCreate: input.tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 })
  }
}
