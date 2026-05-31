import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'
import { env } from '../config/env.js'
import { asyncHandler } from '../utils/http.js'

export const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.get('authorization') || '').split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ detail: 'Missing or invalid authorization header' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (payload.type !== 'access' || !payload.sub) {
      return res.status(401).json({ detail: 'Invalid token' })
    }

    req.userId = Number(payload.sub)
    return next()
  } catch {
    return res.status(401).json({ detail: 'Invalid token' })
  }
}

export const requireAdmin = asyncHandler(async (req, res, next) => {
  const [accounts] = await pool.execute(
    `SELECT account_type FROM accounts
     WHERE id = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [req.userId],
  )

  if (!accounts.length || accounts[0].account_type !== 'ADMIN') {
    return res.status(403).json({ detail: 'Admin access required' })
  }

  return next()
})
