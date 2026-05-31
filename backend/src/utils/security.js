import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const createTokens = (accountId) => ({
  access_token: jwt.sign(
    { sub: String(accountId), type: 'access' },
    env.jwtSecret,
    { expiresIn: `${env.accessTokenMinutes}m` },
  ),
  refresh_token: jwt.sign(
    { sub: String(accountId), type: 'refresh' },
    env.jwtSecret,
    { expiresIn: `${env.refreshTokenDays}d` },
  ),
  token_type: 'bearer',
})
