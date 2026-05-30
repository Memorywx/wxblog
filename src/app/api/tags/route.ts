import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    select: { name: true },
  })

  return NextResponse.json(tags.map((tag) => tag.name))
}
