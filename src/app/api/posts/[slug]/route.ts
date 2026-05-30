import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'
import { hasRequiredPostFields, normalizePostInput } from '@/lib/post-input'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = verifyAdmin(req)
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: true, comments: { orderBy: { createdAt: 'desc' } } },
  })

  if (!post || (!post.published && !admin)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const shouldTrackView = !admin && req.nextUrl.searchParams.get('view') !== 'false'

  if (shouldTrackView) {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
  }

  return NextResponse.json(shouldTrackView ? { ...post, views: post.views + 1 } : post)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug: currentSlug } = await params

  try {
    const body = await req.json()
    const input = normalizePostInput(body)

    if (!hasRequiredPostFields(input)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.post.findUnique({ where: { slug: currentSlug } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (input.slug !== currentSlug) {
      const conflict = await prisma.post.findUnique({ where: { slug: input.slug } })
      if (conflict && conflict.id !== existing.id) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
    }

    const post = await prisma.post.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt,
        cover: input.cover,
        published: input.published,
        tags: {
          set: [],
          connectOrCreate: input.tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  await prisma.post.delete({ where: { slug } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json() as { published?: unknown }

  if (typeof body.published !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const post = await prisma.post.update({
    where: { slug },
    data: { published: body.published },
    include: { tags: true },
  })

  return NextResponse.json(post)
}
