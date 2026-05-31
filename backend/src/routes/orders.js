import { Router } from 'express'
import { pool } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, httpError, parsePositiveInteger } from '../utils/http.js'
import { repairFields } from '../utils/text.js'

const router = Router()
router.use(requireAuth)

const orderNumber = () => `ORD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
const allowedPaymentMethods = new Set(['COD', 'BANK_TRANSFER', 'MOMO', 'ZALOPAY'])

const findCustomer = async (connection, userId) => {
  const [rows] = await connection.execute('SELECT id FROM customers WHERE account_id = ? LIMIT 1', [userId])
  if (!rows.length) throw httpError(404, 'Không tìm thấy hồ sơ khách hàng')
  return rows[0]
}

const getOrder = async (connection, orderId, customerId) => {
  const [orders] = await connection.execute(
    `SELECT id, order_number, order_number AS order_code, customer_id, status, payment_status,
       shipping_status, item_total AS total_price, discount_total AS discount_amount,
       shipping_fee, grand_total AS final_price, customer_note AS notes, created_at,
       receiver_name, receiver_phone, shipping_province_name, shipping_district_name,
       shipping_ward_name, shipping_address_line,
       (SELECT payment_method FROM payments WHERE order_id = orders.id ORDER BY id LIMIT 1) AS payment_method
     FROM orders WHERE id = ? AND customer_id = ? LIMIT 1`,
    [orderId, customerId],
  )
  if (!orders.length) throw httpError(404, 'Không tìm thấy đơn hàng')
  const [items] = await connection.execute(
    `SELECT id, sku_id, sku_code, product_name, variant_name, color_name, size_name,
       image_url, quantity, unit_price, discount_amount, total_amount AS total_price
     FROM order_items WHERE order_id = ? ORDER BY id`,
    [orderId],
  )
  return {
    ...repairFields(orders[0], [
      'notes', 'receiver_name', 'shipping_province_name', 'shipping_district_name',
      'shipping_ward_name', 'shipping_address_line',
    ]),
    items: items.map((item) => repairFields(item, ['product_name', 'variant_name', 'color_name', 'size_name'])),
  }
}

const findDiscount = async (connection, code, itemTotal, lock = false) => {
  const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : ''
  if (!normalizedCode) return { discountCode: null, discountTotal: 0 }
  const [rows] = await connection.execute(
    `SELECT id, code, name, discount_type, discount_value, min_order_amount,
       max_discount_amount, usage_limit, used_count
     FROM discount_codes
     WHERE code = ? AND status = 'ACTIVE'
       AND (starts_at IS NULL OR starts_at <= CURRENT_TIMESTAMP(6))
       AND (ends_at IS NULL OR ends_at >= CURRENT_TIMESTAMP(6))
     LIMIT 1${lock ? ' FOR UPDATE' : ''}`,
    [normalizedCode],
  )
  if (!rows.length) throw httpError(400, 'Mã giảm giá không hợp lệ hoặc đã hết hạn')
  const discountCode = rows[0]
  if (discountCode.usage_limit !== null && discountCode.used_count >= discountCode.usage_limit) {
    throw httpError(400, 'Mã giảm giá đã hết lượt sử dụng')
  }
  if (itemTotal < Number(discountCode.min_order_amount)) {
    throw httpError(400, `Đơn hàng cần đạt tối thiểu ${Number(discountCode.min_order_amount).toLocaleString('vi-VN')}đ để dùng mã`)
  }
  let discountTotal = discountCode.discount_type === 'PERCENT'
    ? itemTotal * Number(discountCode.discount_value) / 100
    : Number(discountCode.discount_value)
  if (discountCode.max_discount_amount !== null) {
    discountTotal = Math.min(discountTotal, Number(discountCode.max_discount_amount))
  }
  return { discountCode, discountTotal: Math.min(Math.round(discountTotal), itemTotal) }
}

const quoteItems = async (connection, items) => {
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Sản phẩm là bắt buộc')
  let itemTotal = 0
  for (const requestedItem of items) {
    const skuId = parsePositiveInteger(requestedItem.sku_id, 0)
    const quantity = parsePositiveInteger(requestedItem.quantity, 0)
    if (!skuId || !quantity) throw httpError(400, 'Mỗi sản phẩm cần có SKU và số lượng hợp lệ')
    const [skus] = await connection.execute(
      `SELECT ps.price, COALESCE(SUM(ib.qty_available), 0) AS available_qty
       FROM product_skus ps
       JOIN products p ON p.id = ps.product_id
       LEFT JOIN inventory_balances ib ON ib.sku_id = ps.id
       WHERE ps.id = ? AND ps.status = 'ACTIVE' AND p.status = 'ACTIVE'
       GROUP BY ps.id`,
      [skuId],
    )
    if (!skus.length) throw httpError(400, `Không tìm thấy SKU ${skuId}`)
    if (Number(skus[0].available_qty) < quantity) throw httpError(400, 'Sản phẩm không đủ tồn kho')
    itemTotal += Number(skus[0].price) * quantity
  }
  return itemTotal
}

router.post('/quote', asyncHandler(async (req, res) => {
  const itemTotal = await quoteItems(pool, req.body.items)
  const { discountCode, discountTotal } = await findDiscount(pool, req.body.discount_code, itemTotal)
  const shippingFee = itemTotal >= 498000 ? 0 : 30000
  res.json({
    item_total: itemTotal,
    discount_total: discountTotal,
    shipping_fee: shippingFee,
    grand_total: itemTotal - discountTotal + shippingFee,
    discount_code: discountCode?.code || null,
    discount_name: discountCode?.name || null,
  })
}))

router.post('/', asyncHandler(async (req, res) => {
  const addressId = parsePositiveInteger(req.body.shipping_address_id, 0)
  const items = req.body.items
  if (!addressId || !Array.isArray(items) || !items.length) throw httpError(400, 'Địa chỉ giao hàng và sản phẩm là bắt buộc')
  const paymentMethod = req.body.payment_method || 'COD'
  if (!allowedPaymentMethods.has(paymentMethod)) throw httpError(400, 'Phương thức thanh toán không hợp lệ')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const customer = await findCustomer(connection, req.userId)
    const [addresses] = await connection.execute(
      'SELECT * FROM customer_addresses WHERE id = ? AND customer_id = ? LIMIT 1',
      [addressId, customer.id],
    )
    if (!addresses.length) throw httpError(400, 'Địa chỉ giao hàng không hợp lệ')
    const address = addresses[0]

    const snapshots = []
    let itemTotal = 0
    for (const requestedItem of items) {
      const skuId = parsePositiveInteger(requestedItem.sku_id, 0)
      const quantity = parsePositiveInteger(requestedItem.quantity, 0)
      if (!skuId || !quantity) throw httpError(400, 'Mỗi sản phẩm cần có SKU và số lượng hợp lệ')

      const [skus] = await connection.execute(
        `SELECT ps.id, ps.sku_code, ps.variant_name, ps.price, ps.compare_at_price,
           p.name AS product_name, c.name AS color_name, s.name AS size_name,
           (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
            ORDER BY pi.is_thumbnail DESC, pi.sort_order, pi.id LIMIT 1) AS image_url
         FROM product_skus ps
         JOIN products p ON p.id = ps.product_id
         LEFT JOIN colors c ON c.id = ps.color_id
         LEFT JOIN sizes s ON s.id = ps.size_id
         WHERE ps.id = ? AND ps.status = 'ACTIVE' AND p.status = 'ACTIVE'
         LIMIT 1`,
        [skuId],
      )
      if (!skus.length) throw httpError(400, `Không tìm thấy SKU ${skuId}`)

      const [balances] = await connection.execute(
        `SELECT id, qty_on_hand, qty_reserved
         FROM inventory_balances WHERE sku_id = ?
         ORDER BY id FOR UPDATE`,
        [skuId],
      )
      let remaining = quantity
      for (const balance of balances) {
        const reserved = Math.min(remaining, balance.qty_on_hand - balance.qty_reserved)
        if (reserved > 0) {
          await connection.execute(
            'UPDATE inventory_balances SET qty_reserved = qty_reserved + ? WHERE id = ?',
            [reserved, balance.id],
          )
          remaining -= reserved
        }
      }
      if (remaining > 0) throw httpError(400, `Không đủ tồn kho cho ${skus[0].sku_code}`)

      const totalAmount = Number(skus[0].price) * quantity
      itemTotal += totalAmount
      snapshots.push({ ...skus[0], quantity, totalAmount })
    }

    const { discountCode, discountTotal } = await findDiscount(connection, req.body.discount_code, itemTotal, true)
    const shippingFee = itemTotal >= 498000 ? 0 : 30000
    const grandTotal = itemTotal - discountTotal + shippingFee
    const [order] = await connection.execute(
      `INSERT INTO orders (
         order_number, customer_id, discount_code_id, receiver_name, receiver_phone,
         shipping_province_name, shipping_district_name, shipping_ward_name, shipping_address_line,
         item_total, discount_total, shipping_fee, grand_total, customer_note
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber(), customer.id, discountCode?.id || null, address.receiver_name, address.receiver_phone,
        address.province_name, address.district_name, address.ward_name, address.address_line,
        itemTotal, discountTotal, shippingFee, grandTotal, req.body.notes || null,
      ],
    )

    for (const item of snapshots) {
      await connection.execute(
        `INSERT INTO order_items (
           order_id, sku_id, sku_code, product_name, variant_name, color_name, size_name,
           image_url, quantity, unit_price, compare_at_price, total_amount
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.insertId, item.id, item.sku_code, item.product_name, item.variant_name,
          item.color_name, item.size_name, item.image_url, item.quantity, item.price,
          item.compare_at_price, item.totalAmount,
        ],
      )
    }
    await connection.execute(
      `INSERT INTO payments (order_id, payment_method, amount, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [order.insertId, paymentMethod, grandTotal],
    )
    if (discountCode) {
      await connection.execute('UPDATE discount_codes SET used_count = used_count + 1 WHERE id = ?', [discountCode.id])
    }

    await connection.commit()
    res.status(201).json(await getOrder(connection, order.insertId, customer.id))
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/', asyncHandler(async (req, res) => {
  const customer = await findCustomer(pool, req.userId)
  const [orders] = await pool.execute(
    `SELECT id, order_number, order_number AS order_code, status, payment_status, shipping_status,
       item_total AS total_price, discount_total AS discount_amount,
       shipping_fee, grand_total AS final_price, customer_note AS notes, created_at,
       (SELECT payment_method FROM payments WHERE order_id = orders.id ORDER BY id LIMIT 1) AS payment_method
     FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
    [customer.id],
  )
  res.json(orders.map((order) => repairFields(order, ['notes'])))
}))

router.get('/:orderId', asyncHandler(async (req, res) => {
  const customer = await findCustomer(pool, req.userId)
  res.json(await getOrder(pool, parsePositiveInteger(req.params.orderId, 0), customer.id))
}))

export default router
