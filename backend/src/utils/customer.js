import { httpError } from './http.js'

export const findCustomerByAccountId = async (connection, accountId) => {
  const [rows] = await connection.execute(
    'SELECT id FROM customers WHERE account_id = ? LIMIT 1',
    [accountId],
  )
  if (!rows.length) throw httpError(404, 'Không tìm thấy hồ sơ khách hàng')
  return rows[0]
}
