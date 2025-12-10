# 前端结构（Taro）

- `config/`: Taro 编译配置 `dev.js` / `prod.js` / `index.js`。
- `src/app.tsx` & `app.config.ts`: 入口和页面路由。
- `src/pages/`: 页面壳，按角色分区（common/teacher/student/admin）。
- `src/modules/`: 业务模块（auth/students/teachers/inventory/venues/reports/ai-assistant）。
- `src/store/`: 全局状态（Zustand）。
- `src/services/`: API 配置、http 封装、微信登录封装、日志。
- `src/components/`: 复用 UI 组件。
- `src/utils/`: 通用工具。
- `src/styles/`: 主题与全局样式。
- `src/config/`: 路由、菜单、常量。
