import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const photos = await prisma.photo.findMany({
    where: { albumId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(photos)
}
