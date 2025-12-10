# 架构概览

- Monorepo：pnpm workspace，根 `tsconfig.base.json` 统一别名。
- 前端：`apps/mobile-taro` → Taro(React+TS) 多端 H5/小程序，复用共享 SDK。
- 后端：`apps/backend-api` → NestJS + Prisma + PostgreSQL，JWT + RBAC，AI 助手模块。
- 共享：`packages/shared-types` 提供领域模型；`packages/shared-api-client` 提供 API SDK。
- 基础设施：`infra/docker` 镜像/编排，`infra/nginx` 反代，`infra/scripts` 部署与 seed。
