import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，但不包括：
     * - api 路由
     * - 静态文件（如图片、字体等）
     * - favicon.ico
     * - _next 内部文件
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
