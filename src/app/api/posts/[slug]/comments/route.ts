import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, email, content } = body

  if (!name || !email || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: { name, email, content, postId: post.id },
  })

  return NextResponse.json(comment)
}
