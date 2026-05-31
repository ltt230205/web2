import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errors.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import customerRoutes from './routes/customer.js'
import orderRoutes from './routes/orders.js'
import productRoutes from './routes/products.js'

const app = express()
const directory = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: env.allowedOrigins, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.resolve(directory, '../../uploads')))

app.get('/', (req, res) => res.json({ message: 'Fashion Store API', version: 'v1' }))
app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/admin', adminRoutes)
app.use('/auth', authRoutes)
app.use('/customer', customerRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
