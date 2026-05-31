const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const categories = [
  { id: null, name: 'Tất cả', label: 'Tất cả' },
  { id: 1, name: 'Nam', label: 'Nam' },
  { id: 2, name: 'Nữ', label: 'Nữ' },
  { id: 3, name: 'Trẻ em', label: 'Trẻ em' },
  { id: 4, name: 'Đồng phục', label: 'Đồng phục' },
  { id: 11, name: 'Ưu đãi', label: 'Ưu đãi' },
  { id: 12, name: 'Hàng mới về', label: 'Hàng mới về' },
]

export const fallbackProducts = [
  {
    id: 1,
    name: 'Áo Polo Nam Regular Cổ Ép Có Xẻ Tà',
    category_id: 1,
    price: 199000,
    compare_at_price: 299000,
    discount: 33,
    image: '/uploads/products/ao-polo-nam-regular.webp',
    hoverImage: '/uploads/products/ao-polo-nam-regular-2.webp',
    colors: ['#111827', '#ffffff', '#1f3a5f'],
    tag: 'Bán chạy',
  },
  {
    id: 2,
    name: 'Áo Polo Nữ Regular Cổ Ép Có Xẻ Tà',
    category_id: 2,
    price: 199000,
    compare_at_price: 299000,
    discount: 33,
    image: '/uploads/products/ao-polo-nu-regular.webp',
    hoverImage: '/uploads/products/ao-polo-nu-regular-2.webp',
    colors: ['#ffffff', '#f5e7ce', '#f6c4d2'],
    tag: 'Mới về',
  },
  {
    id: 3,
    name: 'Áo Polo Nam Slim Có Khóa Kéo',
    category_id: 1,
    price: 329000,
    compare_at_price: 449000,
    discount: 27,
    image: '/uploads/products/ao-polo-nam-slim.webp',
    hoverImage: '/uploads/products/ao-polo-nam-slim-2.webp',
    colors: ['#102a43', '#d7dce2', '#111827'],
    tag: 'Airycool',
  },
  {
    id: 4,
    name: 'Váy Liền Cổ Đức Đai Eo Xòe Tầng',
    category_id: 2,
    price: 499000,
    compare_at_price: 599000,
    discount: 17,
    image: '/uploads/products/vay-lien-co-duc.webp',
    hoverImage: '/uploads/products/vay-lien-co-duc-2.webp',
    colors: ['#ead8bd', '#ffffff', '#93a3b8'],
    tag: 'Thanh lịch',
  },
]

export const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0))

const looksLikeMojibake = (value) => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    const next = value.charCodeAt(i + 1)
    if ([194, 195, 196, 197, 198, 65533].includes(code)) return true
    if ((code === 225 || code === 193) && (next === 186 || next === 187)) return true
  }
  return false
}

export const repairText = (value) => {
  if (typeof value !== 'string' || !looksLikeMojibake(value)) return value

  const cp1252Bytes = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  }

  let output = value
  for (let i = 0; i < 2; i += 1) {
    try {
      const bytes = Uint8Array.from(
        [...output].map((char) => cp1252Bytes[char.charCodeAt(0)] || (char.charCodeAt(0) & 255))
      )
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      if (decoded === output) break
      output = decoded
    } catch {
      break
    }
  }

  return output
}

export const imageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads')) return path
  return `${API_BASE_URL}${path}`
}

export const normalizeProduct = (product) => {
  const primarySku = product.skus?.[0]
  const image = product.images?.[0]?.image_url || product.image
  const compareAt = product.compare_at_price || primarySku?.compare_at_price
  const price = product.price || product.min_price || primarySku?.price || 199000
  const discount = compareAt && Number(compareAt) > Number(price)
    ? Math.round((1 - Number(price) / Number(compareAt)) * 100)
    : product.discount || 0

  return {
    ...product,
    name: repairText(product.name),
    short_description: repairText(product.short_description),
    description: repairText(product.description),
    image,
    hoverImage: product.images?.[1]?.image_url || product.hoverImage || image,
    price,
    compare_at_price: compareAt || product.compare_at_price,
    discount,
    colors: product.colors?.length ? product.colors.map((color) => color.hex_code || color) : product.colors || [],
    tag: repairText(product.tag || product.brand?.name || 'Yody Demo'),
    brand: product.brand ? { ...product.brand, name: repairText(product.brand.name) } : product.brand,
    category: product.category ? { ...product.category, name: repairText(product.category.name) } : product.category,
  }
}
