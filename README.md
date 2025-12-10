# Tsinglan School Admin (Frontend)

前端保持 Vercel 静态部署，只负责 UI/状态管理并通过校内统一后端 API 获取数据。

## 快速开始
- Node.js 18+
- 安装依赖：`npm install`
- 环境变量：`VITE_API_BASE_URL=https://api.xxx.com`（指向校内后端网关）
- 本地启动：`npm run dev`
- 构建：`npm run build`

## 架构摘要
- 前端：Vite + React + TypeScript，全量走 `/api/...`。
- 后端：推荐 NestJS + Prisma + PostgreSQL，JWT + RBAC；详情见 `ARCHITECTURE.md` 与 `BACKEND_API.md`。
- 数据/文件：PostgreSQL + 本地目录或 MinIO。
- AI：前端 → `/api/ai/...` → 后端调用 Gemini/本地模型，前端不存密钥。

## 代码导览
- `shared/`：跨端通用的 `constants.ts`、`types.ts`、`services/apiClient.ts`、AI stub 等。
- `App.tsx`：web 主界面，已改为直接调用 `apiClient` 对接 `/api`。
- `ARCHITECTURE.md`：整体架构蓝图。
- `BACKEND_API.md`：后端 API 合同。

## 前端迁移步骤
1. 后端按 `BACKEND_API.md` 提供接口。
2. 所有数据流已切到 `apiClient.*`，保持 `/api/*` 兼容；如新增模块继续按该模式调用。
3. 登录流程改为 `/api/auth/login`（HttpOnly Cookie/JWT）；当前已内置“远程优先，失败回退本地密码”。
4. Supabase 依赖与 shim 已移除，保持纯本地 API 模式。

## 部署要点
- Vercel：设置 `VITE_API_BASE_URL` 指向校内反向代理（HTTPS）。
- 校内后端：systemd 常驻，`.env` 含 `DATABASE_URL`、`JWT_SECRET`、`AI_API_KEY`，开启访问日志/审计。
- 文件：本地目录 + Nginx 或 MinIO，经后端签名/代理访问。

## Taro 多端（小程序 + H5）
- 新增 `apps/taro`：使用 Taro + React + TS，已复用 `services/apiClient.ts` 和 `types.ts`。
- 运行（需先 `npm install`，安装 Taro 依赖）：在 `apps/taro` 下 `npm run dev:weapp` 或 `npm run dev:h5`。
- 构建：`npm run build:weapp` / `npm run build:h5`。
- 仍通过 `/api/*` 访问校内后端，登录流程同 web。

## 开发/测试
- 本地联调：后端开放允许的 CORS 源（本地/Vercel 域名）。
- 构建验证：`npm run build`。
