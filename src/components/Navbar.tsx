'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Search, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/posts', label: '文章' },
  { href: '/shuos', label: '说说' },
  { href: '/photos', label: '照片' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'glass-nav' : 'bg-transparent'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
            >
              wxblog
            </Link>

            {/* Center Menu — Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      active
                        ? 'text-[#0071e3] bg-[#0071e3]/8'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <button
                className="hidden sm:flex p-2.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                aria-label="Search"
              >
                <Search size={17} />
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-4 right-4 glass-card p-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'text-[#0071e3] bg-[#0071e3]/8'
                      : 'text-[#6e6e73] hover:bg-black/5 dark:text-[#a1a1a6] dark:hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
