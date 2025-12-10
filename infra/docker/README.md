# Docker 镜像

- 后端：基于 node:18，`apps/backend-api`，包含 Prisma 生成。
- 前端：`apps/mobile-taro` H5 构建后静态产物，可由 Nginx 托管。
- 数据库：PostgreSQL（docker-compose）。
