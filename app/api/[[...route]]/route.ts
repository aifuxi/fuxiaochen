import { handle } from "@hono/vercel";

import { api } from "@/lib/api";

export const runtime = "nodejs";
const handler = handle(api);

function route(request: Request) {
  // Next.js 开发环境传入代理 Request；Hono 请求体限制读取无 Content-Length 的正文后
  // 会克隆请求。使用标准 Request，避免 undici 私有字段无法从代理对象读取。
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: request.headers,
    signal: request.signal,
  };
  if (request.body) {
    init.body = request.body;
    init.duplex = "half";
  }
  return handler(new Request(request.url, init));
}

export const POST = route;
export const GET = route;
export const DELETE = route;

export const PUT = route;

export const PATCH = route;
