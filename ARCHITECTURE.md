# 本地化三层架构蓝图

目标：移除前端直接依赖 Supabase/Gemini，将数据与鉴权收拢到校内后端，前端只负责 UI + 状态管理 + 调统一 API。

## 1) 前端（Vercel）
- 技术：Vite + React + TypeScript，打包静态资源部署到 Vercel。
- 职责：UI、状态、请求后端 API，不再连 Supabase。
- 环境变量：`VITE_API_BASE_URL=https://api.xxx.com`（反向代理到校内后端）。
- API 调用层（示例）：
```ts
// src/services/apiClient.ts
const BASE = import.meta.env.VITE_API_BASE_URL;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 支持 cookie / session
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  // 仅示例，按模块拆分
  inventory: {
    list: () => request<InventoryItem[]>('/api/inventory'),
    upsert: (body: InventoryItem) => request('/api/inventory', { method: 'POST', body: JSON.stringify(body) }),
  },
  teachers: { list: () => request<Teacher[]>('/api/teachers') },
  students: { list: () => request<Student[]>('/api/students') },
  requests: { create: (body: PurchaseRequest) => request('/api/requests', { method: 'POST', body: JSON.stringify(body) }) },
  auth: {
    login: (body: { username: string; password: string }) =>
      request<{ token: string; role: Role }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  ai: {
    summarizeWeeklyReport: (body: { reportId: string }) =>
      request('/api/ai/summarize-weekly-report', { method: 'POST', body: JSON.stringify(body) }),
  },
};
```
- 前端改造步骤：
  1. 新建 `services/apiClient.ts`，集中所有 fetch；`App.tsx` 和组件通过它访问数据。
  2. 用 `VITE_API_BASE_URL` 代替 Supabase URL/Key，逐步替换 `supabase.from(...)` 调用。
  3. 删除 `@supabase/supabase-js` 依赖和相关初始化，UI 状态保持不变。
  4. AI 功能改为 `POST /api/ai/...`，不在前端持有 API Key。

## 2) 后端（校内 Linux）
### 推荐路线 A：NestJS + Prisma + PostgreSQL
- 鉴权：JWT + RBAC（Admin / Teacher / Student），登录接口 `POST /api/auth/login` 发 token，前端存储在 cookie（HttpOnly）。
- 模块划分：`AuthModule`、`UsersModule`（Teacher/Student）、`InventoryModule`、`RequestsModule`、`VenuesModule`、`WeeklyReportModule`、`FilesModule`、`AiModule`。
- Prisma schema 关键片段（示例）：
```prisma
model Teacher {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  status       String   // ACTIVE / LEAVE / RESIGNED
  visaExpiry   DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Student {
  id        String   @id @default(cuid())
  name      String
  grade     String
  status    String   // ENROLLED / TRANSFERRED / GRADUATED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Inventory {
  id          String   @id @default(cuid())
  name        String
  category    String
  quantity    Int
  unit        String
  price       Float
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Request {
  id          String   @id @default(cuid())
  itemName    String
  quantity    Int
  unitPrice   Float
  totalAmount Float
  status      String   // PENDING_DIRECTOR / APPROVED / REJECTED / STOCKED ...
  requesterId String
  requester   User     @relation(fields: [requesterId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
- API 示例：
  - `GET /api/inventory`、`POST /api/inventory`、`PATCH /api/inventory/:id`
  - `GET /api/teachers`、`POST /api/teachers`
  - `GET /api/students`
  - `POST /api/requests`、`PATCH /api/requests/:id/status`
  - `GET /api/weekly-report/:id`、`POST /api/weekly-report`
  - `POST /api/ai/summarize-weekly-report`
- 日志/审计：Nest 的 Interceptor + Prisma middleware 记录 `userId`、`action`、`resource`。
- 部署：systemd 管理 Nest 服务；使用 `.env` 注入 `DATABASE_URL`、`JWT_SECRET`、`AI_API_KEY`。

### 可选路线 B：FastAPI + SQLAlchemy + Alembic
- 同样的模块拆分与 API 形态；适合更偏 Python 的团队。

## 3) 数据与文件存储
- 数据库：PostgreSQL（兼容 Supabase 结构，迁移方便）。校内单机或独立 DB 服务器。
- 迁移路径：
  1. 从 Supabase 导出 schema/data（pg_dump）。
  2. 在校内 PG 恢复；用 Prisma `prisma db pull` 同步 schema。
  3. 补充索引、外键、审计字段。
- 文件：本地文件系统 + Nginx 静态目录，或内部 MinIO（S3 兼容）。

## 4) AI 调用
- 前端 -> `POST /api/ai/...` -> 后端再调用 Gemini / 本地大模型。
- 好处：密钥不出网、可切换模型、可加配额和日志。
- Nest 示例：
```ts
// ai.controller.ts
@Post('summarize-weekly-report')
summarize(@Body() dto: SummarizeDto, @Req() req) {
  return this.aiService.summarizeWeeklyReport(dto.reportId, req.user.id);
}
```

## 5) 落地改造顺序（建议 2-4 周内完成）
1. **后端脚手架**：初始化 Nest + Prisma + PostgreSQL，定义基础模型（Teacher/Student/Inventory/Request/WeeklyReport）。
2. **鉴权上线**：实现登录、JWT、RBAC 中间件；前端改为通过登录获取 token。
3. **替换数据流**：前端逐个模块将 `supabase.from()` 改为 `api.*` 调用；后端完成对应 CRUD。
4. **文件与 AI 收拢**：文件上传改到 `/api/files/upload`；AI 改到 `/api/ai/...`。
5. **监控与日志**：接入 HTTP/DB 请求日志、审计表；部署时加备份策略。
6. **清理依赖**：移除 Supabase SDK、前端 Gemini 直连代码。

按上述拆分，前端继续留在 Vercel，所有数据与敏感操作都在校内 Linux 后端完成，符合“本地存储 + 统一后端”的要求，并便于后续增加模块（资产、排课、报修、周报等）。
