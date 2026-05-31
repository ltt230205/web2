import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import multer from 'multer'
import { pool } from '../config/database.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { asyncHandler, httpError, parsePositiveInteger } from '../utils/http.js'
import { repairFields } from '../utils/text.js'

const router = Router()
router.use(requireAuth, requireAdmin)
const productUploadDirectory = path.resolve(process.cwd(), '..', 'uploads', 'products')
fs.mkdirSync(productUploadDirectory, { recursive: true })
const uploadProductImage = multer({
  storage: multer.diskStorage({
    destination: productUploadDirectory,
    filename: (req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith('image/')),
})

const allowedGenders = new Set(['MALE', 'FEMALE', 'UNISEX', 'KIDS'])
const allowedStatuses = new Set(['DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED'])
const cancellableOrderStatuses = new Set(['PENDING', 'CONFIRMED'])
const fieldLabels = {
  product_code: 'Mã sản phẩm',
  name: 'Tên sản phẩm',
  slug: 'Đường dẫn',
  min_price: 'Giá bán',
  max_price: 'Giá so sánh',
}

const requiredText = (value, field, maxLength) => {
  const label = fieldLabels[field] || field
  const result = typeof value === 'string' ? value.trim() : ''
  if (!result) throw httpError(400, `${label} là bắt buộc`)
  if (result.length > maxLength) throw httpError(400, `${label} quá dài`)
  return result
}

const optionalText = (value, maxLength = Number.MAX_SAFE_INTEGER) => {
  const result = typeof value === 'string' ? value.trim() : ''
  if (result.length > maxLength) throw httpError(400, 'Nội dung nhập vào quá dài')
  return result || null
}

const price = (value, field) => {
  const label = fieldLabels[field] || field
  const result = Number(value)
  if (!Number.isFinite(result) || result < 0) throw httpError(400, `${label} phải là số không âm`)
  return result
}

const productInput = (body) => {
  const minPrice = price(body.min_price, 'min_price')
  const maxPrice = price(body.max_price ?? body.min_price, 'max_price')
  if (maxPrice < minPrice) throw httpError(400, 'Giá so sánh phải lớn hơn hoặc bằng giá bán')

  const categoryIds = [...new Set(
    (Array.isArray(body.category_ids) ? body.category_ids : [body.category_id])
      .map((categoryId) => parsePositiveInteger(categoryId, 0))
      .filter(Boolean),
  )]
  if (!categoryIds.length) throw httpError(400, 'Bạn cần chọn ít nhất một danh mục')

  const brandId = body.brand_id ? parsePositiveInteger(body.brand_id, 0) : null
  if (body.brand_id && !brandId) throw httpError(400, 'Thương hiệu không hợp lệ')

  const gender = body.gender_target || 'UNISEX'
  if (!allowedGenders.has(gender)) throw httpError(400, 'Đối tượng sản phẩm không hợp lệ')

  const status = body.status || 'ACTIVE'
  if (!allowedStatuses.has(status)) throw httpError(400, 'Trạng thái sản phẩm không hợp lệ')

  return {
    brandId,
    categoryIds,
    productCode: requiredText(body.product_code, 'product_code', 100),
    name: requiredText(body.name, 'name', 255),
    slug: requiredText(body.slug, 'slug', 255),
    shortDescription: optionalText(body.short_description, 1000),
    description: optionalText(body.description),
    material: optionalText(body.material, 255),
    careInstruction: optionalText(body.care_instruction),
    gender,
    status,
    isFeatured: Boolean(body.is_featured),
    minPrice,
    maxPrice,
    imageUrl: optionalText(body.image_url, 1000),
  }
}

const insertDefaultSku = async (connection, productId, input) => {
  await connection.execute(
    `INSERT INTO product_skus (
       product_id, sku_code, variant_key, variant_name, price, compare_at_price, status
     ) VALUES (?, ?, 'DEFAULT', 'Mặc định', ?, ?, 'ACTIVE')`,
    [productId, `${input.productCode.slice(0, 92)}-DEFAULT`, input.minPrice, input.maxPrice],
  )
}

const replaceProductCategories = async (connection, productId, categoryIds) => {
  await connection.execute('DELETE FROM product_categories WHERE product_id = ?', [productId])
  for (const categoryId of categoryIds) {
    await connection.execute(
      'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
      [productId, categoryId],
    )
  }
}

const handleMutationError = (error) => {
  if (error.code === 'ER_DUP_ENTRY') throw httpError(400, 'Mã sản phẩm, slug hoặc SKU đã tồn tại')
  if (error.code === 'ER_NO_REFERENCED_ROW_2') throw httpError(400, 'Thương hiệu hoặc danh mục không tồn tại')
  throw error
}

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [[products]] = await pool.query(`SELECT COUNT(*) AS total FROM products WHERE status = 'ACTIVE'`)
  const [[customers]] = await pool.query(`SELECT COUNT(*) AS total FROM accounts WHERE account_type = 'CUSTOMER'`)
  const [[admins]] = await pool.query(`SELECT COUNT(*) AS total FROM accounts WHERE account_type = 'ADMIN'`)
  const [[orders]] = await pool.query(`SELECT COUNT(*) AS total FROM orders`)
  const [[revenue]] = await pool.query(`SELECT COALESCE(SUM(grand_total), 0) AS total FROM orders WHERE status = 'COMPLETED'`)
  const [[pendingOrders]] = await pool.query(`SELECT COUNT(*) AS total FROM orders WHERE status IN ('PENDING', 'CONFIRMED')`)
  const [dailyRevenue] = await pool.query(
    `SELECT DATE(completed_at) AS date, SUM(grand_total) AS revenue
     FROM orders
     WHERE status = 'COMPLETED' AND completed_at >= CURRENT_DATE - INTERVAL 30 DAY
     GROUP BY DATE(completed_at)
     ORDER BY date`,
  )
  const [monthlyRevenue] = await pool.query(
    `SELECT DATE_FORMAT(completed_at, '%Y-%m') AS month, SUM(grand_total) AS revenue
     FROM orders
     WHERE status = 'COMPLETED' AND completed_at >= CURRENT_DATE - INTERVAL 12 MONTH
     GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
     ORDER BY month`,
  )
  const [bestSelling] = await pool.query(
    `SELECT oi.product_name AS name, SUM(oi.quantity) AS quantity
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'COMPLETED'
     GROUP BY oi.product_name
     ORDER BY quantity DESC, oi.product_name
     LIMIT 5`,
  )

  res.json({
    products: products.total,
    customers: customers.total,
    admins: admins.total,
    orders: orders.total,
    revenue: revenue.total,
    pending_orders: pendingOrders.total,
    daily_revenue: dailyRevenue,
    monthly_revenue: monthlyRevenue,
    best_selling: bestSelling.map((item) => repairFields(item, ['name'])),
  })
}))

router.post('/uploads/product-image', uploadProductImage.single('image'), (req, res) => {
  if (!req.file) throw httpError(400, 'Vui lòng chọn file ảnh hợp lệ')
  res.status(201).json({ image_url: `/uploads/products/${req.file.filename}` })
})

router.get('/customers', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, c.id AS customer_id, a.full_name, a.email, a.phone, a.status, a.created_at,
       COUNT(o.id) AS order_count,
       COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.grand_total ELSE 0 END), 0) AS total_spent
     FROM accounts a
     JOIN customers c ON c.account_id = a.id
     LEFT JOIN orders o ON o.customer_id = c.id
     WHERE a.account_type = 'CUSTOMER'
     GROUP BY a.id, c.id
     ORDER BY a.created_at DESC`,
  )
  res.json(rows.map((row) => repairFields(row, ['full_name'])))
}))

router.get('/categories', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, parent_id, name, slug, description, sort_order, status
     FROM categories ORDER BY parent_id IS NOT NULL, sort_order, id`,
  )
  res.json(rows.map((row) => repairFields(row, ['name', 'description'])))
}))

const categoryInput = (body) => ({
  parentId: body.parent_id ? parsePositiveInteger(body.parent_id, 0) : null,
  name: requiredText(body.name, 'Tên danh mục', 255),
  slug: requiredText(body.slug, 'Đường dẫn', 255),
  description: optionalText(body.description),
  sortOrder: Number.isInteger(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
})

router.post('/categories', asyncHandler(async (req, res) => {
  const input = categoryInput(req.body)
  try {
    const [result] = await pool.execute(
      `INSERT INTO categories (parent_id, name, slug, description, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.parentId, input.name, input.slug, input.description, input.sortOrder, input.status],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    handleMutationError(error)
  }
}))

router.put('/categories/:categoryId', asyncHandler(async (req, res) => {
  const categoryId = parsePositiveInteger(req.params.categoryId, 0)
  if (!categoryId) throw httpError(400, 'Mã danh mục không hợp lệ')
  const input = categoryInput(req.body)
  if (input.parentId === categoryId) throw httpError(400, 'Danh mục không thể là danh mục cha của chính nó')
  try {
    const [result] = await pool.execute(
      `UPDATE categories
       SET parent_id = ?, name = ?, slug = ?, description = ?, sort_order = ?, status = ?
       WHERE id = ?`,
      [input.parentId, input.name, input.slug, input.description, input.sortOrder, input.status, categoryId],
    )
    if (!result.affectedRows) throw httpError(404, 'Không tìm thấy danh mục')
    res.json({ id: categoryId })
  } catch (error) {
    handleMutationError(error)
  }
}))

router.delete('/categories/:categoryId', asyncHandler(async (req, res) => {
  const categoryId = parsePositiveInteger(req.params.categoryId, 0)
  const [result] = await pool.execute(`UPDATE categories SET status = 'INACTIVE' WHERE id = ?`, [categoryId])
  if (!result.affectedRows) throw httpError(404, 'Không tìm thấy danh mục')
  res.status(204).end()
}))

router.get('/inventory', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ib.id, ib.stock_location_id, sl.name AS location_name, ps.id AS sku_id,
       ps.sku_code, ps.variant_name, p.id AS product_id, p.name AS product_name,
       ib.qty_on_hand, ib.qty_reserved, ib.qty_available
     FROM inventory_balances ib
     JOIN stock_locations sl ON sl.id = ib.stock_location_id
     JOIN product_skus ps ON ps.id = ib.sku_id
     JOIN products p ON p.id = ps.product_id
     ORDER BY p.name, ps.id, sl.id`,
  )
  res.json(rows.map((row) => repairFields(row, ['location_name', 'variant_name', 'product_name'])))
}))

router.patch('/inventory/:balanceId', asyncHandler(async (req, res) => {
  const balanceId = parsePositiveInteger(req.params.balanceId, 0)
  const qtyOnHand = Number(req.body.qty_on_hand)
  if (!balanceId || !Number.isInteger(qtyOnHand) || qtyOnHand < 0) throw httpError(400, 'Số lượng tồn kho không hợp lệ')
  const [result] = await pool.execute(
    `UPDATE inventory_balances SET qty_on_hand = ?
     WHERE id = ? AND qty_reserved <= ?`,
    [qtyOnHand, balanceId, qtyOnHand],
  )
  if (!result.affectedRows) throw httpError(409, 'Không thể đặt tồn kho thấp hơn lượng đang giữ hoặc không tìm thấy SKU')
  res.json({ id: balanceId, qty_on_hand: qtyOnHand })
}))

const discountInput = (body) => {
  const type = body.discount_type === 'FIXED' ? 'FIXED' : 'PERCENT'
  const value = Number(body.discount_value)
  if (!Number.isFinite(value) || value < 0 || (type === 'PERCENT' && value > 100)) {
    throw httpError(400, 'Giá trị giảm giá không hợp lệ')
  }
  return {
    code: requiredText(body.code, 'Mã giảm giá', 50).toUpperCase(),
    name: requiredText(body.name, 'Tên chương trình', 255),
    type,
    value,
    minOrderAmount: Math.max(0, Number(body.min_order_amount) || 0),
    maxDiscountAmount: body.max_discount_amount ? Math.max(0, Number(body.max_discount_amount)) : null,
    usageLimit: body.usage_limit ? parsePositiveInteger(body.usage_limit, null) : null,
    status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  }
}

router.get('/discount-codes', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM discount_codes ORDER BY created_at DESC, id DESC')
  res.json(rows.map((row) => repairFields(row, ['name'])))
}))

router.post('/discount-codes', asyncHandler(async (req, res) => {
  const input = discountInput(req.body)
  try {
    const [result] = await pool.execute(
      `INSERT INTO discount_codes (
         code, name, discount_type, discount_value, min_order_amount,
         max_discount_amount, usage_limit, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.code, input.name, input.type, input.value, input.minOrderAmount, input.maxDiscountAmount, input.usageLimit, input.status],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    handleMutationError(error)
  }
}))

router.put('/discount-codes/:discountId', asyncHandler(async (req, res) => {
  const discountId = parsePositiveInteger(req.params.discountId, 0)
  const input = discountInput(req.body)
  try {
    const [result] = await pool.execute(
      `UPDATE discount_codes
       SET code = ?, name = ?, discount_type = ?, discount_value = ?,
         min_order_amount = ?, max_discount_amount = ?, usage_limit = ?, status = ?
       WHERE id = ?`,
      [input.code, input.name, input.type, input.value, input.minOrderAmount, input.maxDiscountAmount, input.usageLimit, input.status, discountId],
    )
    if (!result.affectedRows) throw httpError(404, 'Không tìm thấy mã giảm giá')
    res.json({ id: discountId })
  } catch (error) {
    handleMutationError(error)
  }
}))

router.delete('/discount-codes/:discountId', asyncHandler(async (req, res) => {
  const discountId = parsePositiveInteger(req.params.discountId, 0)
  const [result] = await pool.execute(`UPDATE discount_codes SET status = 'INACTIVE' WHERE id = ?`, [discountId])
  if (!result.affectedRows) throw httpError(404, 'Không tìm thấy mã giảm giá')
  res.status(204).end()
}))

const getAdminOrders = async (connection) => {
  const [orders] = await connection.execute(
    `SELECT o.id, o.order_number, o.order_number AS order_code, o.status, o.payment_status,
       o.shipping_status, o.receiver_name, o.receiver_phone, o.shipping_province_name,
       o.shipping_district_name, o.shipping_ward_name, o.shipping_address_line,
       o.item_total AS total_price, o.shipping_fee, o.grand_total AS final_price,
       o.discount_total AS discount_amount, o.customer_note AS notes, o.created_at, o.completed_at,
       (SELECT payment_method FROM payments WHERE order_id = o.id ORDER BY id LIMIT 1) AS payment_method,
       a.full_name AS customer_name, a.email AS customer_email
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     LEFT JOIN accounts a ON a.id = c.account_id
     ORDER BY o.created_at DESC`,
  )
  if (!orders.length) return []

  const placeholders = orders.map(() => '?').join(', ')
  const [items] = await connection.execute(
    `SELECT id, order_id, sku_id, sku_code, product_name, variant_name, color_name,
       size_name, quantity, unit_price, total_amount AS total_price
     FROM order_items
     WHERE order_id IN (${placeholders})
     ORDER BY id`,
    orders.map((order) => order.id),
  )
  const itemsByOrder = new Map()
  for (const item of items) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, [])
    itemsByOrder.get(item.order_id).push(item)
  }
  return orders.map((order) => ({
    ...repairFields(order, [
      'receiver_name', 'shipping_province_name', 'shipping_district_name',
      'shipping_ward_name', 'shipping_address_line', 'notes', 'customer_name',
    ]),
    items: (itemsByOrder.get(order.id) || []).map((item) => repairFields(item, [
      'product_name', 'variant_name', 'color_name', 'size_name',
    ])),
  }))
}

const releaseReservedInventory = async (connection, orderId, deductOnHand) => {
  const [items] = await connection.execute(
    `SELECT sku_id, SUM(quantity) AS quantity
     FROM order_items
     WHERE order_id = ? AND sku_id IS NOT NULL
     GROUP BY sku_id`,
    [orderId],
  )

  for (const item of items) {
    const [balances] = await connection.execute(
      `SELECT id, qty_on_hand, qty_reserved
       FROM inventory_balances
       WHERE sku_id = ? AND qty_reserved > 0
       ORDER BY id
       FOR UPDATE`,
      [item.sku_id],
    )
    let remaining = Number(item.quantity)
    for (const balance of balances) {
      const released = Math.min(remaining, balance.qty_reserved)
      if (!released) continue
      if (deductOnHand && balance.qty_on_hand < released) {
        throw httpError(409, 'Tồn kho không đủ để hoàn tất đơn hàng')
      }
      await connection.execute(
        `UPDATE inventory_balances
         SET qty_reserved = qty_reserved - ?, qty_on_hand = qty_on_hand - ?
         WHERE id = ?`,
        [released, deductOnHand ? released : 0, balance.id],
      )
      remaining -= released
      if (!remaining) break
    }
    if (remaining) throw httpError(409, 'Số lượng giữ trong kho không đủ cho đơn hàng')
  }
}

router.get('/orders', asyncHandler(async (req, res) => {
  res.json(await getAdminOrders(pool))
}))

router.patch('/orders/:orderId/status', asyncHandler(async (req, res) => {
  const orderId = parsePositiveInteger(req.params.orderId, 0)
  if (!orderId) throw httpError(400, 'Mã đơn hàng không hợp lệ')
  const action = req.body.action
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [orders] = await connection.execute(
      'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
      [orderId],
    )
    if (!orders.length) throw httpError(404, 'Không tìm thấy đơn hàng')
    const order = orders[0]

    if (action === 'PICKED_UP') {
      if (!cancellableOrderStatuses.has(order.status)) {
        throw httpError(409, 'Chỉ có thể lấy đơn hàng đang chờ xử lý')
      }
      await connection.execute(
        `UPDATE orders
         SET status = 'SHIPPING', shipping_status = 'SHIPPING',
           confirmed_at = COALESCE(confirmed_at, CURRENT_TIMESTAMP(6))
         WHERE id = ?`,
        [orderId],
      )
    } else if (action === 'DELIVERED') {
      if (order.status !== 'SHIPPING') {
        throw httpError(409, 'Chỉ có thể hoàn tất đơn hàng đang giao')
      }
      await releaseReservedInventory(connection, orderId, true)
      await connection.execute(
        `UPDATE orders
         SET status = 'COMPLETED', shipping_status = 'DELIVERED',
           completed_at = CURRENT_TIMESTAMP(6)
         WHERE id = ?`,
        [orderId],
      )
    } else if (action === 'CANCELLED') {
      if (!cancellableOrderStatuses.has(order.status)) {
        throw httpError(409, 'Chỉ có thể hủy đơn hàng đang chờ xử lý')
      }
      await releaseReservedInventory(connection, orderId, false)
      await connection.execute(
        `UPDATE orders
         SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP(6)
         WHERE id = ?`,
        [orderId],
      )
      await connection.execute(
        `UPDATE discount_codes dc
         JOIN orders o ON o.discount_code_id = dc.id
         SET dc.used_count = GREATEST(dc.used_count - 1, 0)
         WHERE o.id = ?`,
        [orderId],
      )
    } else {
      throw httpError(400, 'Thao tác đơn hàng không hợp lệ')
    }

    await connection.commit()
    res.json({ id: orderId, action })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.post('/products', asyncHandler(async (req, res) => {
  const input = productInput(req.body)
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [product] = await connection.execute(
      `INSERT INTO products (
         brand_id, product_code, name, slug, short_description, description, material,
         care_instruction, gender_target, status, is_featured, min_price, max_price
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.brandId, input.productCode, input.name, input.slug, input.shortDescription,
        input.description, input.material, input.careInstruction, input.gender,
        input.status, input.isFeatured, input.minPrice, input.maxPrice,
      ],
    )
    await replaceProductCategories(connection, product.insertId, input.categoryIds)
    await insertDefaultSku(connection, product.insertId, input)
    if (input.imageUrl) {
      await connection.execute(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail)
         VALUES (?, ?, ?, 1, TRUE)`,
        [product.insertId, input.imageUrl, input.name],
      )
    }

    await connection.commit()
    res.status(201).json({ id: product.insertId })
  } catch (error) {
    await connection.rollback()
    handleMutationError(error)
  } finally {
    connection.release()
  }
}))

router.put('/products/:productId', asyncHandler(async (req, res) => {
  const productId = parsePositiveInteger(req.params.productId, 0)
  if (!productId) throw httpError(400, 'Mã sản phẩm không hợp lệ')
  const input = productInput(req.body)
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [product] = await connection.execute(
      `UPDATE products
       SET brand_id = ?, product_code = ?, name = ?, slug = ?, short_description = ?,
         description = ?, material = ?, care_instruction = ?, gender_target = ?,
         status = ?, is_featured = ?, min_price = ?, max_price = ?, deleted_at = NULL
       WHERE id = ?`,
      [
        input.brandId, input.productCode, input.name, input.slug, input.shortDescription,
        input.description, input.material, input.careInstruction, input.gender,
        input.status, input.isFeatured, input.minPrice, input.maxPrice, productId,
      ],
    )
    if (!product.affectedRows) throw httpError(404, 'Không tìm thấy sản phẩm')

    await replaceProductCategories(connection, productId, input.categoryIds)

    const [skus] = await connection.execute(
      'SELECT id FROM product_skus WHERE product_id = ? ORDER BY id LIMIT 1',
      [productId],
    )
    if (skus.length) {
      await connection.execute(
        `UPDATE product_skus
         SET price = ?, compare_at_price = ?
         WHERE id = ?`,
        [input.minPrice, input.maxPrice, skus[0].id],
      )
    } else {
      await insertDefaultSku(connection, productId, input)
    }

    if (input.imageUrl) {
      const [images] = await connection.execute(
        `SELECT id FROM product_images
         WHERE product_id = ?
         ORDER BY is_thumbnail DESC, sort_order, id
         LIMIT 1`,
        [productId],
      )
      if (images.length) {
        await connection.execute(
          'UPDATE product_images SET image_url = ?, alt_text = ?, is_thumbnail = TRUE WHERE id = ?',
          [input.imageUrl, input.name, images[0].id],
        )
      } else {
        await connection.execute(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_thumbnail)
           VALUES (?, ?, ?, 1, TRUE)`,
          [productId, input.imageUrl, input.name],
        )
      }
    }

    await connection.commit()
    res.json({ id: productId })
  } catch (error) {
    await connection.rollback()
    handleMutationError(error)
  } finally {
    connection.release()
  }
}))

router.delete('/products/:productId', asyncHandler(async (req, res) => {
  const productId = parsePositiveInteger(req.params.productId, 0)
  if (!productId) throw httpError(400, 'Mã sản phẩm không hợp lệ')

  const [product] = await pool.execute(
    `UPDATE products
     SET status = 'INACTIVE', deleted_at = CURRENT_TIMESTAMP(6)
     WHERE id = ? AND status <> 'INACTIVE'`,
    [productId],
  )
  if (!product.affectedRows) throw httpError(404, 'Không tìm thấy sản phẩm hoặc sản phẩm đã bị xóa')
  res.status(204).end()
}))

export default router
