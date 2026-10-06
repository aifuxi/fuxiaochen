import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-origin";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    // 登录页允许读取 noindex；后台内容继续由服务端鉴权保护。
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/design-spec"] },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
