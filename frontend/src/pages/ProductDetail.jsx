import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productService } from '../services/api'
import { useAuthStore, useCartStore } from '../services/store'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { fallbackProducts, formatPrice, imageUrl, normalizeProduct, repairText } from '../services/catalog'

function uniqueBy(items, keyFn) {
  const seen = new Set()
  return items.filter((item) => {
    const key = keyFn(item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState('')
  const [selectedSkuId, setSelectedSkuId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState('')
  const { isAuthenticated, user } = useAuthStore((state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }))
  const canUseCart = user?.account_type === 'CUSTOMER'
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await productService.getProduct(id)
        const normalized = normalizeProduct(response.data)
        const image = normalized.images?.[0]?.image_url || normalized.image
        setProduct(normalized)
        setActiveImage(image)
        setSelectedSkuId(normalized.skus?.[0]?.id || null)
      } catch (err) {
        const fallback = fallbackProducts.find((item) => String(item.id) === String(id))
        if (fallback) {
          const normalized = normalizeProduct(fallback)
          setProduct(normalized)
          setActiveImage(normalized.image)
        } else {
          setError('Không tìm thấy sản phẩm hoặc API đang tạm thời không phản hồi.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const selectedSku = useMemo(() => {
    return product?.skus?.find((sku) => sku.id === selectedSkuId) || product?.skus?.[0]
  }, [product, selectedSkuId])

  const price = Number(selectedSku?.price || product?.price || 0)
  const compareAt = Number(selectedSku?.compare_at_price || product?.compare_at_price || 0)
  const discount = compareAt > price ? Math.round((1 - price / compareAt) * 100) : product?.discount || 0
  const availableQty = Number(selectedSku?.available_qty || 0)
  const images = product?.images?.length
    ? product.images.map((image) => image.image_url)
    : [product?.image, product?.hoverImage].filter(Boolean)
  const colors = uniqueBy(product?.colors || [], (color) => color.hex_code || color.name)
  const sizes = uniqueBy(product?.sizes || [], (size) => size.name)

  const handleAddToCart = (goToCart = false) => {
    if (!canUseCart) return
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/products/${id}`
      return
    }
    if (!selectedSku || availableQty < 1) {
      setCartMessage('Biến thể này đang hết hàng.')
      return
    }
    if (quantity > availableQty) {
      setCartMessage(`Chỉ còn ${availableQty} sản phẩm trong kho.`)
      return
    }

    addItem({
      sku_id: selectedSku?.id || Number(product.id),
      product_id: product.id,
      product_name: product.name,
      product_code: product.product_code,
      image_url: activeImage || product.image,
      variant_name: repairText(selectedSku?.variant_name || selectedSku?.sku_code || 'Mac dinh'),
      unit_price: price,
      compare_at_price: compareAt,
      available_qty: availableQty,
      quantity,
    })
    setCartMessage('Đã thêm sản phẩm vào giỏ hàng.')

    if (goToCart) {
      window.location.href = '/cart'
    }
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        {loading ? (
          <section className="container py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div className="aspect-[4/5] animate-pulse rounded bg-gray-100" />
              <div className="grid content-start gap-4">
                <div className="h-10 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-14 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </section>
        ) : error ? (
          <section className="container py-16 text-center">
            <h1 className="text-3xl font-black text-[#14315f]">Không tìm thấy sản phẩm</h1>
            <p className="mt-3 text-gray-600">{error}</p>
            <a href="/products" className="mt-6 inline-flex rounded bg-[#14315f] px-6 py-3 font-bold text-white">
              Quay lại danh sách
            </a>
          </section>
        ) : (
          <>
            <section className="border-b border-gray-100 bg-[#f6f7fb]">
              <div className="container py-5 text-sm font-semibold text-gray-500">
                <a href="/">Trang chủ</a> / <a href="/products">Sản phẩm</a> /{' '}
                <span className="text-[#14315f]">{product.name}</span>
              </div>
            </section>

            <section className="container grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4 md:grid-cols-[92px_1fr]">
                <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:grid md:content-start">
                  {images.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`h-20 w-16 shrink-0 overflow-hidden rounded border bg-gray-100 ${
                        activeImage === image ? 'border-[#14315f]' : 'border-gray-200'
                      }`}
                    >
                      <img src={imageUrl(image)} alt={product.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="order-1 overflow-hidden rounded bg-gray-100 md:order-2">
                  <img
                    src={imageUrl(activeImage || product.image)}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
              </div>

              <aside className="lg:sticky lg:top-[120px] lg:self-start">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded bg-[#ffcf33] px-3 py-1 text-xs font-black text-[#14315f]">
                    {repairText(product.tag)}
                  </span>
                  {discount > 0 && (
                    <span className="rounded bg-red-600 px-3 py-1 text-xs font-black text-white">-{discount}%</span>
                  )}
                </div>

                <h1 className="text-3xl font-black leading-tight text-[#14315f] md:text-4xl">{product.name}</h1>
                <p className="mt-3 text-sm font-semibold text-gray-500">
                  Mã SP: {product.product_code || `YD-${product.id}`} | Thương hiệu: {product.brand?.name || 'YODY Demo'}
                </p>

                <div className="mt-5 flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-black text-red-600">{formatPrice(price)}</span>
                  {compareAt > price && (
                    <span className="text-lg font-semibold text-gray-400 line-through">{formatPrice(compareAt)}</span>
                  )}
                </div>

                {product.short_description && (
                  <p className="mt-5 rounded border border-gray-200 bg-gray-50 p-4 leading-7 text-gray-700">
                    {product.short_description}
                  </p>
                )}

                {colors.length > 0 && (
                  <div className="mt-6">
                    <h2 className="mb-3 font-black text-gray-900">Màu sắc</h2>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.hex_code || color.name}
                          type="button"
                          title={repairText(color.name)}
                          className="h-9 w-9 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.hex_code || color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-black text-gray-900">Kích cỡ</h2>
                      <button className="text-sm font-bold text-[#14315f] hover:underline">Hướng dẫn chọn size</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size.name}
                          type="button"
                          className="min-w-[52px] rounded border border-gray-300 px-4 py-2 font-bold hover:border-[#14315f] hover:bg-[#fff5cc]"
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.skus?.length > 0 && (
                  <div className="mt-6">
                    <h2 className="mb-3 font-black text-gray-900">Biến thể</h2>
                    <select
                      value={selectedSkuId || ''}
                      onChange={(event) => { setSelectedSkuId(Number(event.target.value)); setQuantity(1) }}
                      className="min-h-[46px] w-full rounded border border-gray-300 px-4 font-semibold outline-none focus:border-[#14315f]"
                    >
                      {product.skus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {repairText(sku.variant_name || sku.sku_code)} - {sku.available_qty > 0 ? `Còn ${sku.available_qty}` : 'Hết hàng'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-6">
                  <h2 className="mb-3 font-black text-gray-900">Số lượng</h2>
                  <p className={`mb-3 text-sm font-bold ${availableQty > 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {availableQty > 0 ? `Còn ${availableQty} sản phẩm` : 'Biến thể đang hết hàng'}
                  </p>
                  <div className="inline-flex overflow-hidden rounded border border-gray-300">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="h-11 w-11 font-black hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="grid h-11 w-14 place-items-center border-x border-gray-300 font-black">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(Math.max(availableQty, 1), value + 1))}
                      className="h-11 w-11 font-black hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {canUseCart && (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={availableQty < 1}
                      onClick={() => handleAddToCart(false)}
                      className="min-h-[52px] rounded bg-[#14315f] px-5 font-black text-white hover:bg-[#0d2448] disabled:bg-gray-300"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      type="button"
                      disabled={availableQty < 1}
                      onClick={() => handleAddToCart(true)}
                      className="min-h-[52px] rounded bg-[#ffcf33] px-5 font-black text-[#14315f] hover:bg-[#f2bf1f] disabled:bg-gray-200"
                    >
                      Mua ngay
                    </button>
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                    Bạn cần đăng nhập để sử dụng giỏ hàng.
                  </p>
                )}

                {cartMessage && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    <span>{cartMessage}</span>
                    <a href="/cart" className="text-[#14315f] hover:underline">Xem giỏ</a>
                  </div>
                )}

                <div className="mt-7 grid gap-3 rounded border border-gray-200 p-4 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <span className="font-bold">Giao hàng</span>
                    <span>Freeship đơn từ 498K</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold">Đổi trả</span>
                    <span>15 ngày với sản phẩm còn tem mác</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold">Thanh toán</span>
                    <span>COD, chuyển khoản, ví điện tử</span>
                  </div>
                </div>
              </aside>
            </section>

            <section className="border-t border-gray-100 bg-[#f6f7fb] py-10">
              <div className="container grid gap-6 lg:grid-cols-3">
                <div className="rounded border border-gray-200 bg-white p-6 lg:col-span-2">
                  <h2 className="text-2xl font-black text-[#14315f]">Mô tả sản phẩm</h2>
                  <p className="mt-4 leading-8 text-gray-700">
                    {product.description || 'Sản phẩm thời trang Yody Demo với thiết kế dễ mặc, phù hợp nhiều nhu cầu hằng ngày.'}
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-6">
                  <h2 className="text-2xl font-black text-[#14315f]">Thông tin chất liệu</h2>
                  <div className="mt-4 grid gap-3 text-sm text-gray-700">
                    <p><strong>Chất liệu:</strong> {repairText(product.material || 'Cotton pha')}</p>
                    <p><strong>Bảo quản:</strong> {repairText(product.care_instruction || 'Giặt máy chế độ nhẹ, phơi nơi thoáng mát.')}</p>
                    <p><strong>Danh mục:</strong> {repairText(product.category?.name || 'Sản phẩm')}</p>
                  </div>
                </div>
              </div>
            </section>
            {product.related_products?.length > 0 && (
              <section className="container py-10">
                <h2 className="text-2xl font-black text-[#14315f]">Sản phẩm liên quan</h2>
                <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
                  {product.related_products.map((item) => (
                    <a key={item.id} href={`/products/${item.id}`} className="group">
                      <img src={imageUrl(item.image)} alt={item.name} className="aspect-[3/4] w-full rounded bg-gray-100 object-cover transition group-hover:scale-[1.02]" />
                      <h3 className="mt-3 font-bold text-gray-800">{item.name}</h3>
                      <p className="mt-1 font-black text-red-600">{formatPrice(item.price)}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
