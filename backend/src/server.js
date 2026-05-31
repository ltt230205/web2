import app from './app.js'
import { pool } from './config/database.js'
import { env } from './config/env.js'

await pool.query('SELECT 1')

app.listen(env.port, '0.0.0.0', () => {
  console.log(`Fashion Store API listening on port ${env.port}`)
})
