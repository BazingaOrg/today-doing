import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { headers, cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Today Doing",
  description:
    "一个现代化的待办事项应用，支持智能日期分组、实时搜索、多主题切换，带来流畅优雅的使用体验。",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });

  try {
    await supabase.auth.getSession();
  } catch (error) {
    console.error("Error getting session:", error);
  }

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://npm.elemecdn.com/lxgw-wenkai-webfont@1.6.0/style.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-serif font-light">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
