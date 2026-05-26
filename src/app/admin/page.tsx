'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'
import { getAdminPath } from '@/lib/admin-path'

export default function AdminLoginPage() {
  const router = useRouter()

  const [gatePassed, setGatePassed] = useState(false)
  const [gatePassword, setGatePassword] = useState('')
  const [gateError, setGateError] = useState('')
  const [gateLoading, setGateLoading] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 从当前 URL 推断隐藏路径并缓存（兼容 cookie 未生效的情况）
    const currentPath = window.location.pathname.split('/')[1]
    if (currentPath && currentPath !== 'admin') {
      localStorage.setItem('admin_path', currentPath)
    }

    if (localStorage.getItem('admin_gate_passed') === '1') {
      setGatePassed(true)
    }
    if (localStorage.getItem('admin_token')) {
      router.push(`/${getAdminPath()}/dashboard`)
    }
  }, [router])

  async function verifyGate(e: React.FormEvent) {
    e.preventDefault()
    setGateLoading(true)
    setGateError('')

    const res = await fetch('/api/admin/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: gatePassword }),
    })

    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('admin_gate_passed', '1')
      if (data.path) localStorage.setItem('admin_path', data.path)
      setGatePassed(true)
    } else {
      setGateError('访问密码错误')
    }
    setGateLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      const { token } = await res.json()
      localStorage.setItem('admin_token', token)
      router.push(`/${getAdminPath()}/dashboard`)
    } else {
      setError('用户名或密码错误')
      setLoading(false)
    }
  }

  if (!gatePassed) {
    return (
      <div className="max-w-sm mx-auto pt-24">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white">
              <Lock size={22} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">管理后台</h1>
            <p className="text-xs text-[#86868b] mt-1">请输入访问密码</p>
          </div>

          <form onSubmit={verifyGate} className="space-y-4">
            <input
              type="password"
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              placeholder="访问密码"
              className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              required
            />
            {gateError && <p className="text-sm text-red-500">{gateError}</p>}
            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-all"
            >
              {gateLoading ? '验证中...' : '进入'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto pt-24">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[#0071e3] flex items-center justify-center text-white">
            <Shield size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">管理后台</h1>
          <p className="text-xs text-[#86868b] mt-1">默认账号 admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5 uppercase tracking-wide">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#86868b] mb-1.5 uppercase tracking-wide">密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-all"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
