import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET() {
  const shuos = await prisma.shuo.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(shuos)
}

export async function POST(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { content, images, color } = body

  const shuo = await prisma.shuo.create({
    data: { content, images: JSON.stringify(images || []), color: color || '#f59e0b' },
  })

  return NextResponse.json(shuo)
}

export async function DELETE(req: NextRequest) {
  const admin = verifyAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.shuo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
