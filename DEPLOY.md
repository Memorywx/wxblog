# wxblog 部署指南

## 技术栈
- 前端：Next.js 16 + Tailwind CSS + TypeScript
- 后端：Next.js API Routes
- 数据库：PostgreSQL（开发时 SQLite，生产必须 PostgreSQL）
- ORM：Prisma 7
- 部署平台：Vercel（推荐）

---

## 免费服务选型（个人够用）

| 服务 | 提供商 | 免费额度 |
|------|--------|----------|
| 前端托管 | **Vercel** | 无限带宽，100GB 流量/月 |
| 数据库 | **Neon** | 500MB 存储，190 计算小时/月 |
| 图片存储 | 外部 URL / 图床 | 免费 |

> 照片上传功能暂未接入，目前使用外部图片 URL（如 `https://picsum.photos` 或图床链接）。

---

## 部署前准备

### 1. 注册账号
- [Vercel](https://vercel.com) — 用 GitHub 账号登录
- [Neon](https://neon.tech) — 用 GitHub 账号登录

### 2. Neon 创建数据库
1. 登录 Neon → New Project
2. 选择区域（建议选 `Singapore` 或 `Tokyo`，离中国近）
3. 创建后复制 **Connection String**，格式如下：
   ```
   postgresql://user:password@host.neon.tech/wxblog?sslmode=require
   ```

### 3. 推送代码到 GitHub
```bash
cd wxblog
git init
git add .
git commit -m "init"
# 在 GitHub 创建仓库，然后：
git remote add origin https://github.com/你的用户名/wxblog.git
git push -u origin main
```

---

## Vercel 部署步骤

### 1. 导入项目
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Add New Project**
3. 选择你的 GitHub 仓库 `wxblog`
4. Framework Preset 自动识别为 **Next.js**

### 2. 配置环境变量
点击 **Environment Variables**，添加：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...`（Neon 的连接串） |
| `ADMIN_SECRET` | 任意强密码，用于 JWT 签名 |

> 不要填 `ADMIN_GATE`，除非你额外做了登录页保护。

### 3. 部署
点击 **Deploy**，等待构建完成（约 1-2 分钟）。

### 4. 初始化数据库
部署成功后，在 Vercel 的 **Runtime Logs** 或本地执行：
```bash
# 设置本地环境变量后执行
export DATABASE_URL="你的Neon连接串"
npx prisma migrate dev --name init
npx prisma db seed
```

或在 Vercel Console 的 **Function Logs** 里访问一次 `/api/admin/seed` 接口来初始化数据。

---

## 部署后访问

| 地址 | 说明 |
|------|------|
| `https://你的项目.vercel.app` | 前台博客 |
| `https://你的项目.vercel.app/admin` | 管理后台登录 |
| `https://你的项目.vercel.app/admin/dashboard` | 管理后台 |
| `https://你的项目.vercel.app/admin/editor` | 文章编辑器 |

默认账号：`admin` / `admin123`

---

## 自动刷新说明

前台已实现自动刷新：
- **首页**：每 30 秒自动刷新 Server Component 数据
- **文章列表 / 说说 / 照片墙**：每 30 秒通过 SWR 自动拉取最新数据

后台发布文章后，前台用户**无需手动刷新**，最多等待 30 秒即可看到更新。

---

## 后续维护

### 更新部署
每次 `git push` 到 main 分支，Vercel 会自动重新部署。

### 数据库迁移
修改 `prisma/schema.prisma` 后：
```bash
npx prisma migrate dev --name 描述
```

### 自定义域名（可选）
Vercel Dashboard → Project Settings → Domains → 添加你的域名。
