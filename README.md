# <div align="center">fuxiaochen</div>

**本项目是一个个人学习技术和探索的项目，随时可能有 breaking change。不建议！！！不建议 ！！！不建议 ！！！用于生产环境，欢迎一起互相交流学习～**

## 简介

![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
[![Blog](https://img.shields.io/badge/-fuxiaochen.com-0ea5e9?style=for-the-badge&logo=Bloglovin&logoColor=white&label=个人博客)](https://fuxiaochen.com/)

一个简单的个人博客网站，使用 Next.js + React 18 + TypeScript + Shadcn/ui + Tailwind CSS 开发

## 特性

- 使用 Next.js v14 + React 18 hooks 进行构建，完美支持 SSR

- 使用 Meilisearch 支持博客和片段的全文搜索

- 使用 TypeScript 编写，提供类型安全性和更好的开发体验

- 使用 Prisma 简化数据库 CRUD 操作

- 使用 Redis + ioredis 统计网站浏览量、博客和片段浏览量

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

## 快速开始

### 环境准备

确保你已安装

- Git
- Pnpm
- Node.js >= 20
- Docker、Docker Compose

### 获取项目代码

```bash
git clone https://github.com/aifuxi/fuxiaochen.git
```

### 安装依赖

在项目根目录下运行以下命令安装项目依赖：

```bash
pnpm install
```

### 准备数据库

开发环境，推荐使用 Docker Compose 启动一个 MySQL，项目已经准备好了一个 `docker-compose.yaml` 文件

#### Mac 或者 Linux

项目已经准备好了一个 `Makefile` 文件

在项目根目录下运行

```bash
# Docker Compose 只启动 MySQL
make run_mysql8

# Docker Compose 只启动 Redis
make run_redis

# Docker Compose 启动全部服务
make run_all
```

#### Windows

在项目根目录下运行

```bash
# Docker Compose 只启动 MySQL
docker-compose up -d mysql8

# Docker Compose 只启动 Redis
docker-compose up -d redis

# Docker Compose 启动全部服务
docker-compose up -d
```

#### 更多

更多信息可查看项目内的 `docker-compose.yaml` 和 `Makefile` 文件

### 准备 env 文件和配置

#### 配置 `.env` 文件

> `.env` 文件主要是给 Prisma 用的，Prisma 读取 DATABASE_URL 进行数据库连接

新建一个 `.env` 文件，在 `.env` 文件新增以下内容

```.env
# DATABASE_URL 格式为 mysql://用户名:用户密码@数据库IP:数据库端口/需要连接的数据库名
# 根据实际情况进行修改
DATABASE_URL="mysql://root:123456@127.0.0.1:3306/fuxiaochen"

# 根据实际情况进行修改
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
```

#### 配置 `.env.development` 文件

> `.env.development` 文件是开发环境的配置文件，Next.js 在开发模式会自动加载 .env.development 的内容

复制一份 `.env.example`，重命名为 `.env.development`，根据自己实际情况修改以下字段

Github 登录用，如果不用 Github 登录，可不配置

- `AUTH_GITHUB_ID`：Github 授权应用 ID
- `AUTH_GITHUB_SECRET`：Github 授权应用 secret

必须配置

- `NEXT_PUBLIC_ADMIN_EMAILS`：ADMIN 邮箱列表，只有配置在这里的邮箱，才允许在后台管理进行新增、修改、删除操作

如何获取授权应用的 ID 和 secret，可以跟着小付哥（不是我）这篇文章来：[基于Next14+Auth5实现Github、Google、Gitee平台授权登录和邮箱密码登录](https://juejin.cn/post/7329736763060518931)

- `NEXT_PUBLIC_MEILISEARCH_HOST`：Meilisearch 服务地址

- `NEXT_PUBLIC_MEILISEARCH_KEY`：Meilisearch 服务 Master key

Meilisearch 是一个类似 Elasticsearch 的搜索引擎，更轻量，对机器要求比于 Elasticsearch 低很多，点这里 [Meilisearch](https://www.meilisearch.com/) 查看更多 Meilisearch 的信息

### 启动开发服务器

1. 创建表

```bash
pnpm db:push
```

2. 生成 Prisma 类型文件

```bash
pnpm db:gen
```

做了这一步后，重启一下 VS Code（Ctrl/Cmd + Shift + P，然后选 Reload Window），重新加载TypeScript类型文件

3. 启动开发服务器

```bash
pnpm dev
```

4. 预览

- 访问前台: http://localhost:6121
- 访问后台管理: http://localhost:6121/admin

5. 查看数据库

这里推荐使用 Prisma Studio 查看数据，你也可以使用数据库连接软件连接我们的数据库查看数据

新开一个终端，在项目根目录下运行

```bash
pnpm db:studio
```

启动完后会自动打开浏览器，可以在线查看数据库内的数据

### 自定义页面的信息

你可能想修改页面中的信息，请修改 `constants/info.ts` 文件

## 部署

- 视频演示：[手摸手教你如何部署fuxiaochen博客网站](https://www.bilibili.com/video/BV1vz421f7Jr/?share_source=copy_web&vd_source=8b381d6ef205d4d72391e78af40279c0)

- 部署文档：[手摸手教你如何部署fuxiaochen博客网站](https://fuxiaochen.com/blog/hand-to-hand-teaching-you-how-to-deploy-fuxiaochen-blog-site)

## 反馈

遇到任何问题，欢迎给我发邮件反馈，欢迎提 [Issue](https://github.com/aifuxi/fuxiaochen/issues)

## Star History

<a href="https://star-history.com/#aifuxi/fuxiaochen&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=Date" />
 </picture>
</a>

## 感谢

本站开发时，借鉴了以下这些优秀网站（排名不分先后）的很多设计

- [shadcn/ui](https://ui.shadcn.com/)

- [薇尔薇](https://vio.vin/)

- [小植同学](https://blog.xiaoztx.top/)

- [掘金](https://juejin.cn/extension)

- [Orbstack · Blog](https://orbstack.dev/blog)

- [Shiro](https://github.com/Innei/Shiro)

- [LobeHub](https://lobehub.com/zh/blog)

## LICENCE

MIT
