# fuxiaochen

## 管理员登录

复制 `.env.example` 为 `.env.local`，设置 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 和至少 32 个字符的随机 `AUTH_SESSION_SECRET`。部署时在服务端环境变量中设置同样的值。未配置时登录会拒绝所有凭据。

访问 `/login`，使用配置的用户名和密码登录后进入 `/admin`。会话保存在有效期为 7 天的签名 HttpOnly Cookie 中；修改任一管理员凭据或会话密钥会使已有会话失效。
