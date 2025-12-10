# Tsinglan School Monorepo

新起一套干净的多端/后端一体化结构：Taro (React + TS) H5/小程序、NestJS + PostgreSQL，并通过共享类型与 API SDK 联通。

## 目录
- `apps/backend-api`: NestJS + Prisma + PostgreSQL API 服务。
- `apps/mobile-taro`: Taro (React + TS) 多端前端，H5 + 微信小程序。
- `packages/shared-types`: 领域模型类型，前后端共享。
- `packages/shared-api-client`: 通用 API SDK，Taro/前端直接使用，后端可重用 DTO 类型。
- `infra`: Docker/Nginx/脚本。
- `docs`: 架构、API、模块设计文档。

## 开发
- 安装：`pnpm install`
- 全局开发（并行）：`pnpm dev`
- 构建：`pnpm build`
- 代码检查：`pnpm lint`
- 测试：`pnpm test`

## 说明
- 所有子包继承 `tsconfig.base.json`，共享别名 `@tsinglan/shared-types` 与 `@tsinglan/shared-api-client`。
- 后端使用 Prisma schema（`apps/backend-api/prisma/schema.prisma`）定义数据模型，可通过 `seed.ts` 预置基础数据。
- 前端通过 `packages/shared-api-client` 调用 API，Taro 统一封装请求/登录逻辑。

## 部署
- 前置准备：PostgreSQL 实例（设置 `DATABASE_URL`），Node 18+，pnpm 9+。
- 环境变量（后端）：在 `apps/backend-api` 下配置 `.env`（至少含 `DATABASE_URL`、`JWT_SECRET`、`JWT_TTL`、`PORT`）。
- 数据库：`pnpm --filter @tsinglan/backend-api prisma:migrate`，如需初始数据：`pnpm --filter @tsinglan/backend-api prisma:seed`。
- 后端运行：`pnpm --filter @tsinglan/backend-api dev`（或 `build` + `start`），生产可用 Docker；见 `infra/docker` 及 `infra/scripts`。
- 前端 H5：`pnpm --filter @tsinglan/mobile-taro build:h5`，产物在 `apps/mobile-taro/dist`，可由 Nginx 托管；反代 `/api` 到后端，示例见 `infra/nginx`。
- 微信小程序：`pnpm --filter @tsinglan/mobile-taro build:weapp`，用微信开发者工具导入 `apps/mobile-taro/dist` 目录，配置合法域名指向后端 API。
