import dotenv from 'dotenv'

dotenv.config()

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  port: toPositiveInteger(process.env.PORT, 8000),
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: toPositiveInteger(process.env.MYSQL_PORT, 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'fashion_store',
  },
  jwtSecret: process.env.SECRET_KEY || 'your-secret-key-change-this-in-production',
  accessTokenMinutes: toPositiveInteger(process.env.ACCESS_TOKEN_EXPIRE_MINUTES, 30),
  refreshTokenDays: toPositiveInteger(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 7),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
