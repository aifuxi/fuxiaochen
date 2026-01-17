import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 定义失效链接映射表
  const deprecatedRoutes: Record<string, string> = {
    "/blogs": "/blog",
    "/categories": "/blog",
    "/tags": "/blog",
    "/archives": "/blog",
    "/changelogs": "/changelog",
  };

  // 检查当前路径是否为失效链接
  if (deprecatedRoutes[pathname]) {
    return NextResponse.redirect(
      new URL(deprecatedRoutes[pathname], request.url),
      { status: 301 }, // 永久重定向
    );
  }

  // 处理旧版 分类/标签 路径
  if (pathname.startsWith("/category/") || pathname.startsWith("/tag/")) {
    return NextResponse.redirect(
      new URL("/blog", request.url),
      { status: 301 }, // 永久重定向
    );
  }

  // 其他请求正常通过
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/blogs",
    "/categories",
    "/tags",
    "/archives",
    "/changelogs",
    "/category/:path*",
    "/tag/:path*",
  ],
};
