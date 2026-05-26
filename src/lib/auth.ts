import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET = process.env.ADMIN_SECRET || 'wxblog-admin-2024'

export function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    return jwt.verify(token, SECRET) as { username: string }
  } catch {
    return null
  }
}

export function signToken(username: string) {
  return jwt.sign({ username }, SECRET, { expiresIn: '7d' })
}
