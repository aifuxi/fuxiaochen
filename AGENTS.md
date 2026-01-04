# 项目架构概览

## 1. 项目概述

本项目 `fuxiaochen` 是一个全栈应用，包含 Go 语言编写的后端 API 服务，以及采用 Monorepo 管理的前端应用集合。

### 核心架构
- **Backend**: Go (Gin) + MySQL (Gorm)
- **Frontend Monorepo**: pnpm workspace
    - **Admin**: React + Vite + Semi UI
    - **Portal**: Next.js + Tailwind CSS + Shadcn UI

## 2. 目录结构

```
.
├── cmd/                # 应用程序入口
│   ├── api/            # API 服务入口
│   └── migrate/        # 数据库迁移工具入口
├── config/             # 后端配置文件及配置加载逻辑
├── internal/           # 内部业务代码
│   ├── handler/        # 控制层 (HTTP Handlers)
│   ├── service/        # 业务逻辑层
│   ├── repository/     # 数据访问层
│   ├── model/          # 数据模型 (DO) & DTO
│   ├── router/         # 路由定义
│   └── middleware/     # Gin 中间件
├── pkg/                # 公共工具包 (Auth, Logger, Response 等)
├── router/             # 路由配置
├── web/                # 前端 Monorepo 根目录
│   ├── apps/           # 前端应用包
│   │   ├── fuxiaochen-admin/  # 后台管理端 (React SPA)
│   │   └── fuxiaochen-portal/ # 门户网站 (Next.js SSR/SSG)
│   ├── package.json    # Monorepo 依赖与脚本
│   └── pnpm-workspace.yaml # Workspace 定义
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
采用经典的三层分层架构：
1.  **Handler Layer (`internal/handler`)**: 处理 HTTP 请求，参数校验，调用 Service 层，返回响应。
2.  **Service Layer (`internal/service`)**: 核心业务逻辑，事务控制，调用 Repository 层。
3.  **Repository Layer (`internal/repository`)**: 负责数据的 CRUD 操作，直接与数据库交互。

### 开发规范
- **错误处理**: 统一使用 `pkg/response` 包进行响应封装。
- **依赖注入**: 在 `main.go` 中手动组装 Handler、Service 和 Repository 依赖。
- **配置**: 通过 `config/app.yml` (或环境变量) 进行配置。

## 4. 前端架构 (Frontend)

前端项目采用 **pnpm monorepo** 架构，统一管理依赖和构建流程。

### Admin (`web/apps/fuxiaochen-admin`)
- **类型**: Single Page Application (SPA)
- **构建工具**: Vite
- **框架**: React 19
- **UI 组件库**: Semi UI
- **状态管理**: Zustand
- **路由**: React Router v7
- **样式**: Tailwind CSS + Sass

### Portal (`web/apps/fuxiaochen-portal`)
- **类型**: Server Side Rendering (SSR)
- **框架**: Next.js 16 (App Router)
- **UI 组件库**: Radix UI + Shadcn UI
- **样式**: Tailwind CSS
- **图标**: Iconify

## 5. 构建与命令

### 后端
- **启动开发服务器**: `make dev`
- **运行数据库迁移**: `make migrate`

### 前端
前端命令应在 `web/` 目录下执行，无需进入具体子目录。

- **安装依赖**:
    ```bash
    cd web && pnpm install
    ```
- **启动 Admin**:
    ```bash
    cd web && pnpm dev:admin
    ```
- **启动 Portal**:
    ```bash
    cd web && pnpm dev:portal
    ```
- **构建项目**:
    ```bash
    cd web && pnpm build:admin   # 构建 Admin
    cd web && pnpm build:portal  # 构建 Portal
    ```

## 6. 代码规范

- **Go**: 遵循标准 Go fmt 格式。
- **Frontend**: 配置了 ESLint 和 Prettier，提交前需通过 Lint 检查。
- **Git Commit**: 推荐遵循 Conventional Commits 规范。

## 7. 安全与鉴权

- **API 认证**: 使用 JWT Bearer Token。
- **密码存储**: 使用 bcrypt 哈希存储。
- **参数校验**: 严格校验前端输入参数。

## 8. 许可证

本项目采用 [Apache License 2.0](LICENSE) 许可证。
