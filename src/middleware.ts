import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PATH = process.env.ADMIN_PATH || 'admin'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 通过隐藏路径访问 admin，重写到 /admin 内部路由，并种下 cookie
  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const rewritten = pathname.replace(`/${ADMIN_PATH}`, '/admin')
    const response = NextResponse.rewrite(new URL(rewritten, request.url))
    response.cookies.set('admin_path', ADMIN_PATH, {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'strict',
    })
    return response
  }

  // 直接访问 /admin 或 /admin/xxx，404（隐藏真实路径）
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
