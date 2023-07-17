## 前置环境准备

- node 版本>=16
- pnpm

## 开发需要用到的知识

- ![Next.js](https://nextjs.org/docs)的App Router写法
- ![Tailwind CSS](https://tailwindcss.com/)及UI库 ![shadcn/ui](https://ui.shadcn.com/)
- React
- Typescript
- ![Prisma](https://www.prisma.io/)

如果你对上面的技术都不了解，可能无法开发，需要自行补齐

## 启动项目

1. 安装依赖

```bash
pnpm i
```

2. 初始化 prisma 和数据库

```bash
pnpm prisma:dev
```

**注**： 这一步 prisma 会去 github 上下载一些文件，如果你没魔法的的话，可能会等很长时间或者直接下载失败、超时等，需要各位自行解决网络问题。

3. 生成 prisma client 类型定义

```bash
pnpm prisma:generate
```

4. 编辑 env 配置文件

修改`.env`文件，把`WHITELIST_EMAILS`字段的值改为你注册 github 时的邮箱地址，支持多个邮箱，用英文逗号隔开，逗号间不允许有空格

比如：

```txt
WHITELIST_EMAILS="zs@qq.com"
```

或者

```txt
WHITELIST_EMAILS="zs@qq.com,lisi@abc.com"
```

**注**： WHITELIST_EMAILS 这个字段是用来设置在后台界面是否允许增删改数据的

5. 启动开发环境

```bash
pnpm dev
```

6. 浏览器打开，http://localhost:6121/ 查看页面

7. 后台管理界面： http://localhost:6121/admin ，需要使用 github 登录
  
8. 更多配置信息请看`.env.development`文件 

## 部署

因为本项目还在不断更新中，随时可能有破坏性变更，不建议直接部署到生产环境。可以把这个项目当作一个参考，借鉴借鉴里面的代码，把你想要的功能 copy 到你自己的项目里去。

这里挖个坑，后面有空再补全具体的部署流程。

## 其它

有什么问题可以提 issue，或者访问https://aifuxi.cool/about 这个页面查看联系信息，通过微信或者给发邮件和我联系。

## LICENCE

MIT
