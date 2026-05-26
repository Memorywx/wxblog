import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { photos: true } } },
  })
  return NextResponse.json(albums)
}

export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, cover } = body

  const album = await prisma.album.create({
    data: { title, description, cover },
  })

  return NextResponse.json(album)
}

export async function DELETE(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.album.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
