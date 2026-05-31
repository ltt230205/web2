import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, httpError } from '../utils/http.js'
import { createTokens } from '../utils/security.js'

const router = Router()

const customerCode = () => `CUST${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, full_name: fullName, phone = null } = req.body
  if (!isEmail(email) || typeof password !== 'string' || password.length < 8 || typeof fullName !== 'string') {
    throw httpError(400, 'Email, full_name and password with at least 8 characters are required')
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [existing] = await connection.execute('SELECT id FROM accounts WHERE email = ? LIMIT 1', [email])
    if (existing.length) throw httpError(400, 'Email already registered')

    const passwordHash = await bcrypt.hash(password, 12)
    const [account] = await connection.execute(
      `INSERT INTO accounts (email, phone, password_hash, full_name, account_type, status)
       VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
      [email, phone, passwordHash, fullName],
    )
    await connection.execute(
      'INSERT INTO customers (account_id, customer_code) VALUES (?, ?)',
      [account.insertId, customerCode()],
    )
    await connection.commit()
    res.status(201).json(createTokens(account.insertId))
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') throw httpError(400, 'Email or phone already registered')
    throw error
  } finally {
    connection.release()
  }
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!isEmail(email) || typeof password !== 'string') throw httpError(400, 'Email and password are required')

  const [accounts] = await pool.execute(
    'SELECT id, password_hash, status FROM accounts WHERE email = ? LIMIT 1',
    [email],
  )
  const account = accounts[0]
  if (!account || !(await bcrypt.compare(password, account.password_hash))) {
    throw httpError(401, 'Invalid credentials')
  }
  if (account.status !== 'ACTIVE') throw httpError(401, 'Account is not active')

  res.json(createTokens(account.id))
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [accounts] = await pool.execute(
    `SELECT a.id, a.email, a.phone, a.full_name, a.account_type, c.id AS customer_id
     FROM accounts a
     LEFT JOIN customers c ON c.account_id = a.id
     WHERE a.id = ?
     LIMIT 1`,
    [req.userId],
  )
  if (!accounts.length) throw httpError(404, 'Account not found')
  res.json(accounts[0])
}))

export default router
