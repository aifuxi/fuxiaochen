# aifuxi.cool

> 预览地址：<https://aifuxi.cool>

![aifuxi.cool](./resources/qrcode.png)

## 为什么要开发这个项目

- **圆梦**：读大学时候的梦想，有一个自己的网站，记录自己的技术和日常

- **装B**：“秀肌肉”，方便吹牛B

- **锻炼技术**：当前工作内容对自己技术提升有限

- **兴趣**：喜欢写代码和玩游戏

## 项目介绍

使用 `Next.js` 构建的博客类型网站，主要使用以下技术：

- **[React](https://react.dev/)**

- **[TypeScript](https://www.typescriptlang.org/)**

- **[Next.js](https://nextjs.org/)**：React SSR 框架

- **[Tailwind CSS](https://tailwindcss.com/)**：原子化 CSS，写样式巨快巨好用

- **[shadcn/ui](https://ui.shadcn.com/)**：UI 组件库

- **[ByteMD](https://github.com/bytedance/bytemd/)**：Markdown 编辑器

这个项目算是 “秀肌肉” 的项目，集所有我会的技术于一身，包括但不限于：

- 最佳实践

  - CDN，把图片上传到阿里云OSS上
  - 压缩图片，使用 webp 格式的图片，降低图片大小
  - SEO，待补充

- 项目工程化

  - 代码结构和组织方式

  - `eslint` 规范代码

  - `prettier` 格式化代码

  - `husky` Git 操作的不同阶段执行自定义的脚本

    - `pre-commit` 执行 eslint，检查代码格式

    - `commit-msg` 校验 commit 信息是否符合规范

- 运维部署

  - 在 Linux 上使用 pm2 启动 Node.js 项目
  - Nginx
    - 做 Web 服务器，开启 HTTP2，开启 HTTPS
    - 反向代理

## 前置准备

- `Node.js` >= 20.x

- `Pnpm`

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

提 issue 或者给通过 `aifuxi.js@gmail.com` 联系我

## 部署

...待补充

## 待补充

...待补充

## LICENCE

MIT
