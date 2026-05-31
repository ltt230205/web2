import { Router } from 'express'
import { pool } from '../config/database.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler, httpError, parsePositiveInteger } from '../utils/http.js'

const router = Router()
router.use(requireAuth)

const requiredText = (value, label, maxLength) => {
  const result = typeof value === 'string' ? value.trim() : ''
  if (!result) throw httpError(400, `${label} là bắt buộc`)
  if (result.length > maxLength) throw httpError(400, `${label} quá dài`)
  return result
}

const findCustomer = async (connection, userId) => {
  const [rows] = await connection.execute('SELECT id FROM customers WHERE account_id = ? LIMIT 1', [userId])
  if (!rows.length) throw httpError(404, 'Không tìm thấy hồ sơ khách hàng')
  return rows[0]
}

router.get('/addresses', asyncHandler(async (req, res) => {
  const customer = await findCustomer(pool, req.userId)
  const [addresses] = await pool.execute(
    `SELECT id, receiver_name, receiver_phone, province_name, district_name,
       ward_name, address_line, is_default, created_at
     FROM customer_addresses
     WHERE customer_id = ?
     ORDER BY is_default DESC, created_at DESC`,
    [customer.id],
  )
  res.json(addresses)
}))

router.post('/addresses', asyncHandler(async (req, res) => {
  const customer = await findCustomer(pool, req.userId)
  const address = {
    receiverName: requiredText(req.body.receiver_name, 'Tên người nhận', 255),
    receiverPhone: requiredText(req.body.receiver_phone, 'Số điện thoại', 30),
    provinceName: requiredText(req.body.province_name, 'Tỉnh/Thành phố', 100),
    districtName: requiredText(req.body.district_name, 'Quận/Huyện', 100),
    wardName: requiredText(req.body.ward_name, 'Phường/Xã', 100),
    addressLine: requiredText(req.body.address_line, 'Địa chỉ cụ thể', 500),
  }
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const [[{ total }]] = await connection.execute(
      'SELECT COUNT(*) AS total FROM customer_addresses WHERE customer_id = ?',
      [customer.id],
    )
    const isDefault = Boolean(req.body.is_default) || total === 0
    if (isDefault) {
      await connection.execute('UPDATE customer_addresses SET is_default = FALSE WHERE customer_id = ?', [customer.id])
    }
    const [result] = await connection.execute(
      `INSERT INTO customer_addresses (
         customer_id, receiver_name, receiver_phone, province_name,
         district_name, ward_name, address_line, is_default
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer.id, address.receiverName, address.receiverPhone, address.provinceName,
        address.districtName, address.wardName, address.addressLine, isDefault,
      ],
    )
    await connection.commit()
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.delete('/addresses/:addressId', asyncHandler(async (req, res) => {
  const addressId = parsePositiveInteger(req.params.addressId, 0)
  if (!addressId) throw httpError(400, 'Mã địa chỉ không hợp lệ')
  const customer = await findCustomer(pool, req.userId)
  const [result] = await pool.execute(
    'DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?',
    [addressId, customer.id],
  )
  if (!result.affectedRows) throw httpError(404, 'Không tìm thấy địa chỉ')
  res.status(204).end()
}))

export default router
