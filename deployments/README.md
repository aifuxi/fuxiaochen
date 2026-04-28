# 部署配置

本目录保存生产部署相关模板。当前项目使用 Next.js `output: "standalone"`，Docker 镜像内运行入口是 `node server.js`，线上 Nginx 只需要反向代理到本机 `127.0.0.1:3000`。

## 文件

- `nginx/fuxiaochen.conf`：面向 `fuxiaochen.com` 的 HTTPS 反向代理模板。

## Nginx 使用方式

复制模板到服务器 Nginx 配置目录：

```bash
sudo mkdir -p /var/cache/nginx/fuxiaochen-next-static
sudo cp deployments/nginx/fuxiaochen.conf /etc/nginx/conf.d/fuxiaochen.conf
sudo nginx -t
sudo systemctl reload nginx
```

如果服务器使用 `sites-available` / `sites-enabled`，也可以复制到对应目录后创建软链接，但要确保该文件被包含在 Nginx 的 `http` 上下文中。`proxy_cache_path` 和 `upstream` 不能放在 `server` 或 `location` 内。

## 上线前检查

1. 确认应用只监听本机端口，例如 Docker 端口映射使用 `127.0.0.1:3000:3000`。
2. 确认 `BETTER_AUTH_URL` 和 `NEXT_PUBLIC_SITE_URL` 与主域保持一致。模板默认把 `www.fuxiaochen.com` 301 到 `https://fuxiaochen.com`。
3. 确认证书路径存在：

```bash
sudo test -f /root/my-projects/ssl/fuxiaochen.crt
sudo test -f /root/my-projects/ssl/fuxiaochen.key
```

如果你的生产主域是 `www.fuxiaochen.com`，需要把模板中的 301 方向、`server_name` 和环境变量同步改成 `www` 版本。

## 路由策略

- `/_next/static/**`：Next 构建静态资源，Nginx 开启磁盘缓存并透出 `X-Cache-Status`。这些资源文件名带内容哈希，适合长期缓存。
- `/api/**`：认证、后台 CRUD、评论、点赞、浏览统计等接口，统一 `Cache-Control: no-store`，避免浏览器或中间层缓存状态数据。
- `/admin/**`、`/login`、`/register`：登录态相关页面，统一 `private, no-store`。
- `robots.txt`、`sitemap.xml`、`sitemap-*.xml`、`server-sitemap.xml`：短缓存 5 分钟，兼顾爬虫访问和后台内容更新。
- `/logo.svg`、`/avatar.avif`、`/blog-cover-fallback.svg`：当前 `public/` 下的稳定静态资源，缓存 1 天并允许 stale revalidate。

## 验证命令

上线后先确认页面、API 和静态资源响应头：

```bash
curl -I https://fuxiaochen.com/
curl -I https://fuxiaochen.com/api/public/settings
curl -I https://fuxiaochen.com/_next/static/你的实际资源路径
```

`/_next/static/**` 第一次通常是 `X-Cache-Status: MISS`，第二次应变成 `HIT`：

```bash
curl -I https://fuxiaochen.com/_next/static/你的实际资源路径 | grep -i x-cache-status
curl -I https://fuxiaochen.com/_next/static/你的实际资源路径 | grep -i x-cache-status
```

API 应返回：

```text
Cache-Control: no-store
```

如果静态资源始终没有 `HIT`，优先检查 `/var/cache/nginx/fuxiaochen-next-static` 目录权限，以及当前 Nginx 配置是否真的加载了这个文件。

## 注意事项

- 当前项目 `next.config.ts` 设置了 `images.unoptimized = true`，模板没有为 `/_next/image` 单独配置缓存。
- 当前项目没有 WebSocket 或 SSE 常驻连接，因此模板没有全局发送 `Upgrade` / `Connection: upgrade`。
- 不要把 `/api/**` 合并进静态缓存规则；评论、点赞、浏览统计和后台接口都依赖实时状态。
