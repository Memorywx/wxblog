import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import AutoRefresh from '@/components/AutoRefresh'
import './globals.css'

export const metadata: Metadata = {
  title: 'wxblog',
  description: '极简科技风格个人博客',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <div className="bg-layer" />
        <ThemeProvider>
          <AutoRefresh interval={30000} />
          <Navbar />
          <main className="pt-20 pb-24 px-4">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
