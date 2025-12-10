# Backend API Contract (校内服务)

本前端已切换为通过 `/api/*` 调用后端。后端请遵循下列资源格式，返回 JSON，状态码 2xx 表示成功。

## 通用
- 基础路径：`/api`
- 鉴权：推荐 HttpOnly Cookie（或 Authorization: Bearer）。开发期可先跳过鉴权，完成接口联调后再接入 JWT/RBAC。
- Content-Type: `application/json`

## Auth
- `POST /api/auth/login` `{ username, password }` → `{ token, role }`
- `POST /api/auth/refresh` → `{ token, role }`

## Inventory
- `GET /api/inventory` → `InventoryItem[]`
- `POST /api/inventory` (create) / `PUT /api/inventory` (upsert) payload: `InventoryItem | InventoryItem[]`
- `DELETE /api/inventory` body: match 条件 `{ id?: string, name?: string }`

## Requests
- `GET /api/requests` → `PurchaseRequest[]`
- `POST /api/requests` / `PUT /api/requests` payload: `PurchaseRequest | PurchaseRequest[]`
- `PATCH /api/requests` body: `{ criteria, payload }` 例如 `{ criteria: { id }, payload: { status } }`
- `DELETE /api/requests` body: `{ id }`

## Teachers
- `GET /api/teachers` → `Teacher[]`
- `POST` / `PUT` / `DELETE` 同上

## Students
- `GET /api/students` → `Student[]`
- `POST` / `PUT` / `DELETE` 同上

## Fixed Assets
- `GET /api/fixed_assets` → `FixedAsset[]`
- `POST` / `PUT` / `DELETE` 同上

## Calendar Events
- `GET /api/calendar_events` → `CalendarEvent[]`
- `POST` / `PUT` / `DELETE` 同上

## Attendance
- `GET /api/attendance_logs` → `AttendanceRecord[]`
- `POST` / `PUT` / `DELETE` 同上

## Consumptions
- `GET /api/consumptions` → `ClassConsumption[]`
- `POST` / `PUT` / `DELETE` 同上

## Notifications
- `GET /api/notifications` → `Notification[]`
- `POST` / `PUT` / `DELETE` 同上

## Weekly Report
- `GET /api/weekly_report` → `WeeklyReport[]` 或 `{...}`（前端当前取首条）
- `POST` / `PUT` / `DELETE` 同上

## Contracts
- `GET /api/contracts` → `Contract[]`
- `POST` / `PUT` / `DELETE` 同上

## Files
- `GET /api/school_files` → `SchoolFile[]`
- `POST` / `PUT` / `DELETE` 同上

## Recycle Bin
- `GET /api/recycle_bin` → `TrashItem[]`
- `POST` / `PUT` / `DELETE` 同上

## Venues
- `GET /api/venues` → `Venue[]`
- `POST` / `PUT` / `DELETE` 同上

## AI
- `POST /api/ai/summarize-weekly-report` `{ reportId }` → `{ summary }`

> 返回字段模型请参考 `types.ts`。实现时可用 NestJS + Prisma + PostgreSQL，一一映射上述表。
