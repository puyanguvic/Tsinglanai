# API 对齐（示例）

- `POST /auth/login` → 登录，返回 JWT。
- `POST /auth/weapp-login` → 小程序登录。
- `GET /users` → 用户列表（管理员）。
- `GET /students` → 学生列表。
- `GET /teachers` → 教师列表。
- `GET /inventory` → 资产列表。
- `GET /venues` → 场地列表。
- `GET /reports` → 周报列表。
- `GET /requests` → 申请列表。
- `POST /ai-assistant/summarize` → AI 摘要。

所有端共享类型见 `packages/shared-types`，前端调用 SDK `packages/shared-api-client`。
