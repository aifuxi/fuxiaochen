import "server-only";

// SEO 与请求同源校验共用部署域名，避免构建时或请求 Host 固化错误地址。
export function siteOrigin(): string {
  const configured = process.env.APP_ORIGIN;
  if (!configured) throw new Error("请配置 APP_ORIGIN 为站点 origin。");
  const url = new URL(configured);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== configured ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")
  ) {
    throw new Error("APP_ORIGIN 必须为站点 origin，生产环境必须使用 HTTPS");
  }
  return configured;
}

export function siteUrl(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    Array.from(path).some(
      (character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    )
  )
    throw new Error("站内 URL 必须使用绝对路径。");
  const origin = siteOrigin();
  const url = new URL(path, origin);
  if (url.origin !== origin) throw new Error("站内 URL 不可指向其他域名。");
  return url.href;
}
