import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const existing = await prisma.admin.findFirst()
  if (existing) return NextResponse.json({ message: 'Already seeded' })

  const hash = await bcrypt.hash('admin123', 10)
  await prisma.admin.create({
    data: { username: 'admin', password: hash },
  })

  await prisma.post.create({
    data: {
      title: '欢迎使用 wxblog',
      slug: 'welcome',
      content:
        '# 欢迎使用 wxblog\n\n这是一个基于 **Next.js + Prisma** 构建的高颜值全栈博客系统。\n\n## 特性\n\n- 毛玻璃风格 UI + 深色模式\n- Markdown 文章支持\n- 说说 / 照片墙\n- 管理后台\n\n```javascript\nconsole.log("Hello, wxblog!")\n```\n\n> 开始你的写作之旅吧！',
      excerpt: '欢迎使用 wxblog，一个高颜值的全栈博客系统。',
      published: true,
      tags: { create: [{ name: '随笔' }, { name: '技术' }] },
    },
  })

  await prisma.shuo.create({
    data: {
      content: '今天搭建了这个博客，感觉还不错 🎉',
      color: '#f59e0b',
      images: '[]',
    },
  })

  await prisma.album.create({
    data: {
      title: '生活随拍',
      description: '记录生活中的美好瞬间',
      cover: 'https://picsum.photos/400/300?random=1',
      photos: {
        create: [
          { url: 'https://picsum.photos/800/600?random=1', caption: '风景' },
          { url: 'https://picsum.photos/800/600?random=2', caption: '城市' },
          { url: 'https://picsum.photos/800/600?random=3', caption: '自然' },
        ],
      },
    },
  })

  return NextResponse.json({ message: 'Seeded successfully' })
}
