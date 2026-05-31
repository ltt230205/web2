import { Router } from 'express'
import { pool } from '../config/database.js'
import { asyncHandler, httpError, parsePositiveInteger } from '../utils/http.js'
import { repairFields, repairText } from '../utils/text.js'

const router = Router()
const productTextFields = ['name', 'short_description', 'description', 'material', 'care_instruction', 'tag']

const normalizeProduct = (product) => {
  repairFields(product, productTextFields)
  if (product.brand) product.brand.name = repairText(product.brand.name)
  if (product.category) product.category.name = repairText(product.category.name)
  return product
}

router.get('/search/categories', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, parent_id, name, slug, description, sort_order, status
     FROM categories
     WHERE status = 'ACTIVE'
     ORDER BY parent_id IS NOT NULL, sort_order, id`,
  )
  res.json(rows.map((row) => repairFields(row, ['name', 'description'])))
}))

router.get('/search/brands', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, slug, description, status
     FROM brands
     WHERE status = 'ACTIVE'
     ORDER BY id`,
  )
  res.json(rows.map((row) => repairFields(row, ['name', 'description'])))
}))

router.get('/search/filters', asyncHandler(async (req, res) => {
  const [colors] = await pool.query('SELECT id, name, slug, hex_code FROM colors ORDER BY id')
  const [sizes] = await pool.query('SELECT id, name, size_group, sort_order FROM sizes ORDER BY sort_order, id')
  const [[prices]] = await pool.query(
    `SELECT MIN(min_price) AS min_price, MAX(max_price) AS max_price
     FROM products WHERE status = 'ACTIVE'`,
  )
  res.json({
    colors: colors.map((color) => repairFields(color, ['name'])),
    sizes,
    genders: [
      { id: 'MALE', name: 'Nam' },
      { id: 'FEMALE', name: 'Nữ' },
      { id: 'UNISEX', name: 'Unisex' },
      { id: 'KIDS', name: 'Trẻ em' },
    ],
    prices,
  })
}))

router.get('/', asyncHandler(async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1)
  const pageSize = parsePositiveInteger(req.query.page_size, 20, 100)
  const filters = [`p.status = 'ACTIVE'`]
  const values = []

  if (req.query.category_id) {
    filters.push(`EXISTS (
      SELECT 1 FROM product_categories pc_filter
      WHERE pc_filter.product_id = p.id AND pc_filter.category_id = ?
    )`)
    values.push(parsePositiveInteger(req.query.category_id, 0))
  }
  if (req.query.brand_id) {
    filters.push('p.brand_id = ?')
    values.push(parsePositiveInteger(req.query.brand_id, 0))
  }
  if (req.query.gender) {
    filters.push('p.gender_target = ?')
    values.push(req.query.gender)
  }
  if (req.query.min_price) {
    filters.push('p.min_price >= ?')
    values.push(Math.max(0, Number(req.query.min_price) || 0))
  }
  if (req.query.max_price) {
    filters.push('p.min_price <= ?')
    values.push(Math.max(0, Number(req.query.max_price) || 0))
  }
  if (req.query.size_id) {
    filters.push(`EXISTS (
      SELECT 1 FROM product_skus ps_size
      JOIN inventory_balances ib_size ON ib_size.sku_id = ps_size.id
      WHERE ps_size.product_id = p.id AND ps_size.size_id = ?
        AND ps_size.status = 'ACTIVE' AND ib_size.qty_available > 0
    )`)
    values.push(parsePositiveInteger(req.query.size_id, 0))
  }
  if (req.query.color_id) {
    filters.push(`EXISTS (
      SELECT 1 FROM product_skus ps_color
      JOIN inventory_balances ib_color ON ib_color.sku_id = ps_color.id
      WHERE ps_color.product_id = p.id AND ps_color.color_id = ?
        AND ps_color.status = 'ACTIVE' AND ib_color.qty_available > 0
    )`)
    values.push(parsePositiveInteger(req.query.color_id, 0))
  }
  if (req.query.search) {
    filters.push('(p.name LIKE ? OR p.short_description LIKE ?)')
    values.push(`%${req.query.search}%`, `%${req.query.search}%`)
  }

  const orderBy = {
    newest: 'p.created_at DESC, p.id DESC',
    price_asc: 'p.min_price ASC, p.id DESC',
    price_desc: 'p.min_price DESC, p.id DESC',
    best_selling: 'sold_quantity DESC, p.id DESC',
    featured: 'p.is_featured DESC, p.id DESC',
  }[req.query.sort] || 'p.is_featured DESC, p.id DESC'
  const where = filters.join(' AND ')
  const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM products p WHERE ${where}`, values)
  const [rows] = await pool.execute(
    `SELECT
       p.id, p.product_code, p.name, p.slug, p.short_description, p.description,
       p.gender_target, p.is_featured, p.min_price AS price, p.max_price AS compare_at_price,
       b.id AS brand_id, b.name AS brand_name,
       COALESCE(pc.category_id, 0) AS category_id,
       COALESCE(c.name, 'Sản phẩm') AS category_name,
       COALESCE((SELECT SUM(ib.qty_available)
         FROM product_skus ps_stock
         LEFT JOIN inventory_balances ib ON ib.sku_id = ps_stock.id
         WHERE ps_stock.product_id = p.id AND ps_stock.status = 'ACTIVE'), 0) AS available_qty,
       COALESCE((SELECT SUM(oi.quantity)
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN product_skus ps_sold ON ps_sold.id = oi.sku_id
         WHERE ps_sold.product_id = p.id AND o.status = 'COMPLETED'), 0) AS sold_quantity,
       (SELECT GROUP_CONCAT(DISTINCT color.hex_code ORDER BY color.id SEPARATOR ',')
         FROM product_skus ps_color
         JOIN colors color ON color.id = ps_color.color_id
         WHERE ps_color.product_id = p.id AND ps_color.status = 'ACTIVE') AS color_hexes,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
        ORDER BY pi.is_thumbnail DESC, pi.sort_order, pi.id LIMIT 1) AS image,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
        ORDER BY pi.is_thumbnail ASC, pi.sort_order, pi.id LIMIT 1) AS hoverImage
     FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN (
       SELECT product_id, MIN(category_id) AS category_id
       FROM product_categories
       GROUP BY product_id
     ) pc ON pc.product_id = p.id
     LEFT JOIN categories c ON c.id = pc.category_id
     WHERE ${where}
     ORDER BY ${orderBy}
     LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    values,
  )

  const data = rows.map((row) => {
    const product = {
      ...row,
      brand: { id: row.brand_id, name: row.brand_name },
      category: { id: row.category_id, name: row.category_name },
      tag: row.is_featured ? 'Hàng mới' : row.category_name,
      colors: row.color_hexes ? row.color_hexes.split(',') : [],
    }
    delete product.brand_id
    delete product.brand_name
    delete product.category_name
    delete product.color_hexes
    return normalizeProduct(product)
  })
  const totalPages = Math.ceil(total / pageSize)

  res.json({
    page,
    page_size: pageSize,
    total,
    total_pages: totalPages,
    data,
    has_next: page < totalPages,
    has_prev: page > 1,
  })
}))

router.get('/:productId', asyncHandler(async (req, res) => {
  const productId = parsePositiveInteger(req.params.productId, 0)
  const [products] = await pool.execute(
    `SELECT
       p.id, p.product_code, p.name, p.slug, p.short_description, p.description,
       p.material, p.care_instruction, p.gender_target, p.is_featured,
       p.min_price AS price, p.max_price AS compare_at_price,
       b.id AS brand_id, b.name AS brand_name,
       COALESCE(pc.category_id, 0) AS category_id,
       COALESCE(c.name, 'Sản phẩm') AS category_name
     FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     LEFT JOIN (
       SELECT product_id, MIN(category_id) AS category_id
       FROM product_categories
       GROUP BY product_id
     ) pc ON pc.product_id = p.id
     LEFT JOIN categories c ON c.id = pc.category_id
     WHERE p.id = ? AND p.status = 'ACTIVE'`,
    [productId],
  )
  if (!products.length) throw httpError(404, 'Product not found')

  const [images] = await pool.execute(
    `SELECT id, image_url, alt_text, sort_order, is_thumbnail
     FROM product_images WHERE product_id = ?
     ORDER BY is_thumbnail DESC, sort_order, id`,
    [productId],
  )
  const [categories] = await pool.execute(
    `SELECT c.id, c.parent_id, c.name, c.slug
     FROM categories c
     JOIN product_categories pc ON pc.category_id = c.id
     WHERE pc.product_id = ?
     ORDER BY c.parent_id IS NOT NULL, c.sort_order, c.id`,
    [productId],
  )
  const [skus] = await pool.execute(
    `SELECT ps.id, ps.sku_code, ps.price, ps.compare_at_price, ps.variant_key, ps.variant_name,
       ps.status, c.name AS color_name, c.hex_code AS color_hex, s.name AS size_name,
       COALESCE((SELECT SUM(ib.qty_available) FROM inventory_balances ib WHERE ib.sku_id = ps.id), 0) AS available_qty
     FROM product_skus ps
     LEFT JOIN colors c ON c.id = ps.color_id
     LEFT JOIN sizes s ON s.id = ps.size_id
     WHERE ps.product_id = ? AND ps.status = 'ACTIVE'
     ORDER BY ps.id`,
    [productId],
  )

  const product = products[0]
  product.brand = { id: product.brand_id, name: product.brand_name }
  product.category = { id: product.category_id, name: product.category_name }
  delete product.brand_id
  delete product.brand_name
  delete product.category_name
  product.images = images.map((image) => repairFields(image, ['alt_text']))
  product.categories = categories.map((category) => repairFields(category, ['name']))
  product.skus = skus.map((sku) => repairFields(sku, ['variant_name', 'color_name', 'size_name']))
  product.colors = product.skus
    .filter((sku) => sku.color_name && sku.color_hex)
    .map((sku) => ({ name: sku.color_name, hex_code: sku.color_hex }))
  product.sizes = product.skus.filter((sku) => sku.size_name).map((sku) => ({ name: sku.size_name }))
  product.image = product.images[0]?.image_url || null
  product.tag = product.is_featured ? 'Hàng mới' : product.category.name
  const [related] = await pool.execute(
    `SELECT p.id, p.name, p.min_price AS price, p.max_price AS compare_at_price,
       (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id
        ORDER BY pi.is_thumbnail DESC, pi.sort_order, pi.id LIMIT 1) AS image
     FROM products p
     WHERE p.status = 'ACTIVE' AND p.id <> ? AND EXISTS (
       SELECT 1 FROM product_categories related_pc
       JOIN product_categories current_pc ON current_pc.category_id = related_pc.category_id
       WHERE related_pc.product_id = p.id AND current_pc.product_id = ?
     )
     ORDER BY p.is_featured DESC, p.id DESC
     LIMIT 4`,
    [productId, productId],
  )
  product.related_products = related.map((item) => repairFields(item, ['name']))

  res.json(normalizeProduct(product))
}))

export default router
