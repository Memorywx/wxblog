import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: 'desc' },
    include: { album: true },
  })
  return NextResponse.json(photos)
}

export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { url, caption, albumId } = body

  if (!url || !albumId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const photo = await prisma.photo.create({
    data: { url, caption, albumId },
  })

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.photo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
