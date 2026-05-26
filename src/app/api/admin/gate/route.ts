import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATH = process.env.ADMIN_PATH || 'admin'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const gate = process.env.ADMIN_GATE

  if (!gate) {
    return NextResponse.json({ success: true, path: ADMIN_PATH })
  }

  if (password === gate) {
    return NextResponse.json({ success: true, path: ADMIN_PATH })
  }

  return NextResponse.json({ error: 'Gate password incorrect' }, { status: 401 })
}
