import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { tags: true, comments: { orderBy: { createdAt: 'desc' } } },
  })

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  })

  return NextResponse.json(post)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const { title, content, excerpt, cover, published, tagNames } = body

  const existing = await prisma.post.findUnique({ where: { slug }, include: { tags: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.post.update({
    where: { slug },
    data: {
      tags: { disconnect: existing.tags.map((t) => ({ id: t.id })) },
    },
  })

  const post = await prisma.post.update({
    where: { slug },
    data: {
      title,
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
