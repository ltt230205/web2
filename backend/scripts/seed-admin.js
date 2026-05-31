import bcrypt from 'bcryptjs'
import { pool } from '../src/config/database.js'

const email = process.env.ADMIN_EMAIL || 'admin@yody.demo'
const password = process.env.ADMIN_PASSWORD || 'Admin@123'
const fullName = process.env.ADMIN_FULL_NAME || 'YODY Admin'
const passwordHash = await bcrypt.hash(password, 12)

await pool.execute(
  `INSERT INTO accounts (email, password_hash, full_name, account_type, status)
   VALUES (?, ?, ?, 'ADMIN', 'ACTIVE')
   ON DUPLICATE KEY UPDATE
     password_hash = VALUES(password_hash),
     full_name = VALUES(full_name),
     account_type = 'ADMIN',
     status = 'ACTIVE'`,
  [email, passwordHash, fullName],
)

console.log(`Admin account is ready: ${email}`)
await pool.end()
