# <div align="center">fuxiaochen</div>

## 简介

一个简单的个人博客网站，使用 Next.js + React 18 + TypeScript + Shadcn/ui + Tailwind CSS 开发

## 预览

- PC端预览：

  - 前台：https://fuxiaochen.com
  - 后台管理：https://fuxiaochen.com/admin

| <img src="./public/images/pc-home-dark.png" alt="pc-home-dark" /> | <img src="./public/images/pc-admin-dark.png" alt="pc-admin-dark" /> |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| <img src="./public/images/pc-home.png" alt="pc-home" />           | <img src="./public/images/pc-admin.png" alt="ppc-admin" />          |

- 移动端扫描👇下面二维码访问：

| <img src="./public/images/qrcode_fuxiaochen.com.png" alt="qrcode_fuxiaochen.com" /> | <img src="./public/images/mobile-showcase.webp" alt="mobile-showcase" /> |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |

## 特性

- 使用 Next.js v14 + React 18 hooks 进行构建，完美支持 SSR

- 使用 TypeScript 编写，提供类型安全性和更好的开发体验

- 使用 Prisma 简化数据库 CRUD 操作

- 使用 Tailwind CSS + shadcn/ui 编写样式和组件

- 使用 iconify 支持各种 svg 图标

- 使用 Bytemd 实现 Markdown 的编写和预览，自己编写 Bytemd 插件优化 Markdown 的预览

- 使用 next-theme 支持明暗主题切换

- 使用 next-sitemap 生成全站 sitemap ，SEO 友好

- 使用最新的 next-auth v5 支持 Github 和 Google 登录后台管理

- 使用 ahooks 提升开发效率

- 图片上传后使用 sharp 压缩图片成 webp 格式，减小图片体积

- 图片上传到阿里云 OSS，加快访问图片访问速度

- 响应式设计，对部分屏幕尺寸和设备进行适配

- 集成后台管理功能，如博客、片段、标签、笔记管理等

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

## 反馈

欢迎给我发邮件反馈，欢迎提 [Issue](https://github.com/aifuxi/fuxiaochen/issues)

## 部署

...待补充

## 待补充

...待补充

## LICENCE

MIT
