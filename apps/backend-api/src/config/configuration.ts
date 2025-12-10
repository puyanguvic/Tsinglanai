export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    tokenTtl: process.env.JWT_TTL || '2h',
  },
  ai: {
    model: process.env.AI_MODEL || 'gemini-pro',
  },
});
