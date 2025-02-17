# ToDoList 待办事项应用

[English](#english) | [中文](#中文)

## English

### Overview

A modern, elegant todo list application built with Next.js and Tailwind CSS. This project features real-time synchronization, offline support, and a beautiful UI/UX design.

### Features

- 🌓 Light/Dark/System theme support with smooth transitions
- 📱 Responsive design for all devices
- ✨ Beautiful animations and transitions using Framer Motion
- 🔍 Real-time search functionality
- 📊 Todo statistics and filtering (All/Completed/Pending)
- 💾 Cloud storage with Supabase
- 🔄 Offline support with automatic sync
- 🎯 Smart date grouping (Today/Yesterday/Custom date)
- 🔐 Authentication with GitHub and Google
- 📝 Markdown link syntax support in todo items
- 🔄 Real-time updates across devices
- 💫 Smooth animations and micro-interactions
- 🎨 Modern and clean UI design

### Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State Management)
- Radix UI (Accessible Components)
- Supabase (Backend & Authentication)
- Shadcn/ui (UI Components)

### Getting Started

1. Clone the repository

```bash
git clone <repository-url>
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

### Deployment

This project is configured for deployment on Vercel. Simply connect your repository to Vercel for automatic deployments.

### License

MIT License

## 中文

### 概述

一个使用 Next.js 和 Tailwind CSS 构建的现代、优雅的待办事项应用。本项目具有实时同步、离线支持和精美的用户界面设计。

### 功能特性

- 🌓 支持浅色/深色/系统主题，带平滑过渡效果
- 📱 全设备响应式设计
- ✨ 使用 Framer Motion 实现优美的动画和过渡效果
- 🔍 实时搜索功能
- 📊 待办事项统计和筛选（全部/已完成/待完成）
- 💾 使用 Supabase 实现云端存储
- 🔄 支持离线使用，自动同步数据
- 🎯 智能日期分组（今天/昨天/自定义日期）
- 🔐 支持 GitHub 和 Google 账号登录
- 📝 支持在待办事项中使用 Markdown 链接语法
- 🔄 多设备实时更新
- 💫 流畅的动画和微交互
- 🎨 现代简洁的界面设计

### 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand（状态管理）
- Radix UI（无障碍组件）
- Supabase（后端和认证）
- Shadcn/ui（UI 组件）

### 开始使用

1. 克隆仓库

```bash
git clone <仓库地址>
```

2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 设置环境变量

创建 `.env.local` 文件并添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
NEXT_PUBLIC_SITE_URL=你的_站点_url
```

4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. 用浏览器打开 [http://localhost:3000](http://localhost:3000)

### 部署

本项目已配置好用于 Vercel 部署。只需将您的仓库连接到 Vercel 即可实现自动部署。

### 许可证

MIT 许可证
