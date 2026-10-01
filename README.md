# fuxiaochen

## 路由与布局

`app/layout.tsx` 是全站共用的根布局，负责 `html/body`、全局暗色样式、字体、默认 metadata 和唯一的指针动效层。业务布局通过路由分组拆分，括号目录不进入 URL：

| 分组                          | 职责                                                        | URL                  |
| ----------------------------- | ----------------------------------------------------------- | -------------------- |
| `app/(frontend)/`             | 前台页面，首页为 `page.tsx`，独立布局入口为 `layout.tsx`    | `/` 及后续前台路径   |
| `app/(backend)/admin/`        | 管理后台，`layout.tsx` 负责会话校验、后台壳与共享 mock 状态 | `/admin`、`/admin/*` |
| `app/(auth)/login/`           | 登录页面及其专属样式                                        | `/login`             |
| `app/(showcase)/design-spec/` | 设计系统展示及独立 metadata                                 | `/design-spec`       |

新增前台页面放在 `app/(frontend)/` 下，例如 `about/page.tsx` 对应 `/about`。前台共享导航、页脚等写在该分组的 `layout.tsx` 中，仅作用于前台页面，不影响后台、登录或设计展示。分组布局不重复声明 `html/body`，也不重复挂载指针动效。

`app/api/` 保持独立，登录与退出接口仍为 `/api/login` 和 `/api/logout`。链接、表单地址和重定向使用实际 URL，不包含分组名；不同分组中不能定义相同的 URL。

## 管理员登录

复制 `.env.example` 为 `.env.local`，设置 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 和至少 32 个字符的随机 `AUTH_SESSION_SECRET`。部署时在服务端环境变量中设置同样的值。未配置时登录会拒绝所有凭据。

访问 `/login`，使用配置的用户名和密码登录后进入 `/admin`。会话保存在有效期为 7 天的签名 HttpOnly Cookie 中；修改任一管理员凭据或会话密钥会使已有会话失效。
