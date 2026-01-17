# 项目架构概览 (Project Architecture Overview)

本项目 `fuxiaochen` 是一个全栈应用，包含 Go 语言编写的后端 API 服务，以及采用 Monorepo 管理的前端应用集合。

## 1. 项目概述 (Overview)

- **Backend**: Go (Gin) + MySQL (Gorm) + JWT
- **Frontend Monorepo**: pnpm workspace
  - **Admin**: React 19 + Vite + Semi UI (后台管理)
  - **Portal**: Next.js 16 + Tailwind CSS v4 + Shadcn UI (个人门户)

## 2. 目录结构 (Directory Structure)

```
.
├── cmd/                # 应用程序入口
│   ├── api/            # API 服务入口 (main.go)
│   └── migrate/        # 数据库迁移工具入口
├── config/             # 配置定义
├── deployments/        # 部署相关 (Dockerfile, docker-compose)
├── internal/           # 内部业务代码 (Clean Architecture)
│   ├── handler/        # 控制层 (HTTP Handlers)
│   ├── service/        # 业务逻辑层
│   ├── repository/     # 数据访问层
│   ├── model/          # 数据模型 (DO & DTO)
│   ├── router/         # 路由定义
│   └── middleware/     # Gin 中间件
├── pkg/                # 公共工具包 (Auth, Logger, Response, Snowflake 等)
├── web/                # 前端 Monorepo 根目录
│   ├── apps/
│   │   ├── fuxiaochen-admin/  # 后台管理端 (SPA)
│   │   └── fuxiaochen-portal/ # 门户网站 (SSR/SSG)
│   ├── packages/       # 共享包
│   │   └── fuxiaochen-types/  # 共享 TypeScript 类型定义
│   ├── package.json    # Monorepo 依赖与脚本
│   └── pnpm-workspace.yaml
├── Makefile            # 项目构建与运行命令
└── go.mod              # Go 依赖定义
```

## 3. 后端架构 (Backend)

### 技术栈

- **框架**: Gin Web Framework
- **ORM**: GORM
- **数据库**: MySQL
- **配置管理**: Viper
- **日志**: Zap + Lumberjack
- **认证**: JWT (JSON Web Tokens)
- **对象存储**: 阿里云 OSS

### 架构模式
采用经典的分层架构：
1.  **Handler Layer (`internal/handler`)**: 处理 HTTP 请求/响应，参数校验。
2.  **Service Layer (`internal/service`)**: 核心业务逻辑，事务管理。
3.  **Repository Layer (`internal/repository`)**: 数据持久化操作。

## 4. 前端架构 (Frontend)

前端采用 **pnpm workspace** 管理。

### Admin (`web/apps/fuxiaochen-admin`)
- **类型**: Single Page Application (SPA)
- **核心**: React 19, Vite, Zustand, React Router v7
- **UI**: Semi UI (`@douyinfe/semi-ui-19`), Tailwind CSS v4
- **架构**: Feature-based (按业务模块组织 `src/features`)

### Portal (`web/apps/fuxiaochen-portal`)
- **类型**: Server Side Rendering (SSR)
- **框架**: Next.js 16 (App Router)
- **设计风格**: Cyberpunk / Futuristic (赛博朋克/未来主义)
- **UI 组件库**: Shadcn UI + Custom Cyberpunk Components
- **样式**: Tailwind CSS v4 (with CSS Variables)
- **字体**: Orbitron (Display), Exo 2 (Body)
- **核心视觉元素**:
  - **配色**: Neon Cyan, Neon Purple, Cyber Black
  - **特效**: Glassmorphism (毛玻璃), Glitch (故障艺术), Scanlines (扫描线), Neon Glow (霓虹光晕)
- **图标**: Iconify + Skill Icons

## 5. 构建与命令 (Build & Commands)

### 后端 (Root Directory)
- **启动开发服**: `make dev`
- **数据库迁移**: `make migrate`
- **启动数据库**: `make mysql` (Docker)
- **构建 Docker**: `make build-api`, `make build-portal`

### 前端 (`web/` Directory)
- **安装依赖**: `pnpm install`
- **启动 Admin**: `pnpm dev:admin`
- **启动 Portal**: `pnpm dev:portal`
- **构建**: `pnpm build:admin`, `pnpm build:portal`

## 6. 开发指南 (Development Guide)

### 添加新 API
1.  **Backend**:
    - Define Model (`internal/model`)
    - Create Repository (`internal/repository`)
    - Implement Service (`internal/service`)
    - Create Handler (`internal/handler`)
    - Register Route (`internal/router`)
2.  **Frontend**:
    - Update Types (`web/packages/fuxiaochen-types`)
    - Update API Client (`web/apps/fuxiaochen-admin/src/api` or `portal/lib/request.ts`)

### 代码规范
- **Go**: 标准 `go fmt`。
- **Frontend**: ESLint + Prettier。提交前会自动运行 Lint 检查。
- **Commit**: 遵循 Conventional Commits (`feat`, `fix`, `docs`, `chore` 等)。

## 7. 安全与配置 (Security & Config)
- **认证**: API 请求需携带 JWT Token (Bearer)。
- **密码**: 使用 bcrypt 加密存储。
- **配置**: 后端配置通常位于 `config/` 或通过环境变量注入 (Viper)。前端环境变量使用 `.env` 文件。

## 8. 许可证 (License)
本项目采用 [Apache License 2.0](LICENSE) 许可证。
