# Today Doing

## Overview

A modern, elegant todo list application built with Next.js and Tailwind CSS. This project features real-time synchronization, offline support, and a beautiful UI/UX design.

This project was born from a desire to transform daily needs into code, serving both as a practical learning experience and a source of accomplishment. It helps combat procrastination by turning ideas into tangible solutions. The project was developed with the assistance of [v0.dev](https://v0.dev) and [Cursor](https://cursor.sh).

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
