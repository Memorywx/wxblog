import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, password } = body

  const admin = await prisma.admin.findUnique({ where: { username } })
  if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = signToken(username)
  return NextResponse.json({ token })
}
