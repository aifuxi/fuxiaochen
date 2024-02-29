
## 项目介绍

使用 `Next.js` 构建的博客类型网站，主要使用以下技术：

## 启动项目

```shell
# 1. 安装依赖
$ pnpm i

# 2. 准备数据库
$ pnpm db:push

# 3. 生成admin用户，默认相关配置在 .env.development 中
$ pnpm db:seed

# 4. 启动开发环境
$ pnpm dev
```

- **主页**：`http://localhost:6121`

- **登录页**：`http://localhost:6121/sign-in`

  - 初始管理员信息在 `.env.development` 中

  - 初始管理员邮箱：`admin@admin.com`

  - 初始管理员密码：`123456`

## 反馈

提 issue

## 部署

...待补充

## 待补充

...待补充

## LICENCE

MIT
