// 获取隐藏的管理后台路径（client-side）
// 优先从 localStorage 读取（页面加载时由 useEffect 写入），其次 cookie（middleware 种下）
export function getAdminPath(): string {
  if (typeof window === 'undefined') return 'admin'
  const ls = localStorage.getItem('admin_path')
  if (ls) return ls
  const cookieMatch = document.cookie.match(/admin_path=([^;]+)/)
  if (cookieMatch) return cookieMatch[1]
  return 'admin'
}
