import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { addressFields, createEmptyAddress } from '../constants/checkout'
import { customerService, orderService } from '../services/api'
import { useAuthStore, useCartStore } from '../services/store'
import { formatPrice, imageUrl, repairText } from '../services/catalog'

export default function Cart() {
  const { isAuthenticated, user } = useAuthStore((state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }))
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [addressForm, setAddressForm] = useState(createEmptyAddress)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [notes, setNotes] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [quote, setQuote] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [error, setError] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const total = items.reduce((sum, item) => sum + Number(item.unit_price || 0) * item.quantity, 0)
  const discount = items.reduce((sum, item) => {
    const compareAt = Number(item.compare_at_price || 0)
    const price = Number(item.unit_price || 0)
    return sum + Math.max(compareAt - price, 0) * item.quantity
  }, 0)
  const shipping = total >= 498000 || total === 0 ? 0 : 30000
  const orderDiscount = Number(quote?.discount_total || 0)
  const finalTotal = total - orderDiscount + shipping

  useEffect(() => {
    if (!isAuthenticated) window.location.href = '/login?redirect=/cart'
    else if (user?.account_type && user.account_type !== 'CUSTOMER') window.location.href = '/admin'
  }, [isAuthenticated, user?.account_type])

  useEffect(() => {
    setQuote(null)
  }, [items])

  const loadAddresses = async (preferredId) => {
    const response = await customerService.getAddresses()
    const next = response.data
    setAddresses(next)
    const selected = preferredId || next.find((address) => address.is_default)?.id || next[0]?.id || ''
    setSelectedAddressId(String(selected))
    setShowAddressForm(next.length === 0)
  }

  const openCheckout = async () => {
    try {
      setError('')
      await loadAddresses()
      setCheckoutOpen(true)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể tải địa chỉ giao hàng.')
    }
  }

  const saveAddress = async (event) => {
    event.preventDefault()
    try {
      setSavingAddress(true)
      setError('')
      const response = await customerService.createAddress(addressForm)
      await loadAddresses(response.data.id)
      setAddressForm(createEmptyAddress())
      setShowAddressForm(false)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể lưu địa chỉ giao hàng.')
    } finally {
      setSavingAddress(false)
    }
  }

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setError('Vui lòng chọn hoặc thêm địa chỉ giao hàng.')
      return
    }

    try {
      setPlacingOrder(true)
      setError('')
      const response = await orderService.createOrder({
        shipping_address_id: Number(selectedAddressId),
        items: items.map((item) => ({ sku_id: item.sku_id, quantity: item.quantity })),
        notes,
        discount_code: quote?.discount_code || undefined,
        payment_method: paymentMethod,
      })
      clearCart()
      window.location.href = `/account/orders?placed=${encodeURIComponent(response.data.order_code)}`
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể tạo đơn hàng.')
    } finally {
      setPlacingOrder(false)
    }
  }

  const applyDiscount = async () => {
    try {
      setError('')
      const response = await orderService.quoteOrder({
        items: items.map((item) => ({ sku_id: item.sku_id, quantity: item.quantity })),
        discount_code: discountCode,
      })
      setQuote(response.data)
    } catch (requestError) {
      setQuote(null)
      setError(requestError.response?.data?.detail || 'Không thể áp dụng mã giảm giá.')
    }
  }

  if (!isAuthenticated || user?.account_type !== 'CUSTOMER') {
    return (
      <>
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-3xl font-black text-[#14315f]">Cần đăng nhập để xem giỏ hàng</h1>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-[#f6f7fb]">
        <section className="border-b border-gray-100 bg-white">
          <div className="container py-8">
            <p className="text-sm font-semibold text-gray-500">Trang chủ / Giỏ hàng</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-[#14315f]">Giỏ hàng của bạn</h1>
                <p className="mt-2 text-gray-600">Kiểm tra sản phẩm trước khi xác nhận đặt hàng.</p>
              </div>
              {items.length > 0 && (
                <button type="button" onClick={clearCart} className="rounded border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-600">
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="container py-8">
          {error && <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</div>}
          {items.length === 0 ? (
            <div className="rounded border border-dashed border-gray-300 bg-white p-12 text-center">
              <h2 className="text-2xl font-black text-[#14315f]">Giỏ hàng đang trống</h2>
              <a href="/products" className="mt-6 inline-flex rounded bg-[#14315f] px-6 py-3 font-black text-white">Mua sắm ngay</a>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4">
                {items.map((item) => (
                  <article key={item.sku_id} className="grid gap-4 rounded border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr]">
                    <img src={imageUrl(item.image_url)} alt={item.product_name} className="aspect-[3/4] w-full rounded object-cover" />
                    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                      <div>
                        <a href={`/products/${item.product_id}`} className="text-lg font-black text-[#14315f] hover:underline">{repairText(item.product_name)}</a>
                        <p className="mt-2 text-sm font-semibold text-gray-500">{item.product_code} | {repairText(item.variant_name)}</p>
                        <span className="mt-3 block font-black text-red-600">{formatPrice(item.unit_price)}</span>
                      </div>
                      <div className="flex items-end justify-between gap-3 md:grid md:justify-items-end">
                        <div className="inline-flex overflow-hidden rounded border border-gray-300">
                          <button type="button" onClick={() => updateQuantity(item.sku_id, item.quantity - 1)} className="h-10 w-10 font-black">-</button>
                          <span className="grid h-10 w-12 place-items-center border-x border-gray-300 font-black">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.sku_id, item.quantity + 1)} className="h-10 w-10 font-black">+</button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.sku_id)} className="text-sm font-black text-red-600">Xóa</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="lg:sticky lg:top-[120px] lg:self-start">
                <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-[#14315f]">Tạm tính đơn hàng</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between"><span>Tạm tính</span><strong>{formatPrice(total)}</strong></div>
                    <div className="flex justify-between"><span>Tiết kiệm</span><strong className="text-red-600">-{formatPrice(discount)}</strong></div>
                    {orderDiscount > 0 && <div className="flex justify-between"><span>Mã {quote.discount_code}</span><strong className="text-red-600">-{formatPrice(orderDiscount)}</strong></div>}
                    <div className="flex justify-between"><span>Phí giao hàng</span><strong>{shipping ? formatPrice(shipping) : 'Miễn phí'}</strong></div>
                    <div className="flex justify-between border-t border-gray-200 pt-3"><strong>Tổng cộng</strong><strong className="text-xl text-red-600">{formatPrice(finalTotal)}</strong></div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <input value={discountCode} onChange={(event) => setDiscountCode(event.target.value.toUpperCase())} placeholder="Mã giảm giá" className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm font-bold uppercase" />
                    <button type="button" onClick={applyDiscount} className="rounded border border-[#14315f] px-3 py-2 text-sm font-black text-[#14315f]">Áp dụng</button>
                  </div>
                  <button type="button" onClick={openCheckout} className="mt-6 min-h-[50px] w-full rounded bg-[#14315f] font-black text-white">Tiến hành đặt hàng</button>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />

      {checkoutOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto max-w-3xl rounded bg-white p-5 shadow-2xl md:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-[#14315f]">Xác nhận đặt hàng</h2>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="rounded border border-gray-200 px-4 py-2 font-bold">Đóng</button>
            </div>
            {error && <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</div>}

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-[#14315f]">Địa chỉ giao hàng</h3>
                <button type="button" onClick={() => setShowAddressForm((value) => !value)} className="text-sm font-black text-[#14315f]">+ Thêm địa chỉ</button>
              </div>
              <div className="mt-3 grid gap-3">
                {addresses.map((address) => (
                  <label key={address.id} className="flex cursor-pointer gap-3 rounded border border-gray-200 p-4">
                    <input type="radio" name="address" value={address.id} checked={String(selectedAddressId) === String(address.id)} onChange={(event) => setSelectedAddressId(event.target.value)} />
                    <span>
                      <strong>{address.receiver_name} - {address.receiver_phone}</strong>
                      <span className="mt-1 block text-sm text-gray-600">{address.address_line}, {address.ward_name}, {address.district_name}, {address.province_name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {showAddressForm && (
              <form onSubmit={saveAddress} className="mt-5 rounded border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-black text-[#14315f]">Thêm địa chỉ mới</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {addressFields.map(([field, placeholder]) => (
                    <input key={field} required value={addressForm[field]} onChange={(event) => setAddressForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={placeholder} className="rounded border border-gray-200 px-4 py-3" />
                  ))}
                </div>
                <button disabled={savingAddress} className="mt-4 rounded bg-[#14315f] px-5 py-3 font-black text-white disabled:bg-gray-400">{savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}</button>
              </form>
            )}

            <label className="mt-5 grid gap-2 text-sm font-bold">
              Ghi chú đơn hàng
              <textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} className="rounded border border-gray-200 px-4 py-3" placeholder="Ghi chú cho cửa hàng hoặc đơn vị vận chuyển" />
            </label>

            <div className="mt-5">
              <h3 className="font-black text-[#14315f]">Phương thức thanh toán</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ['COD', 'Thanh toán khi nhận hàng'],
                  ['BANK_TRANSFER', 'Chuyển khoản ngân hàng'],
                  ['MOMO', 'Ví MoMo'],
                  ['ZALOPAY', 'Ví ZaloPay'],
                ].map(([value, label]) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 rounded border border-gray-200 p-3 text-sm font-bold">
                    <input type="radio" name="payment_method" value={value} checked={paymentMethod === value} onChange={(event) => setPaymentMethod(event.target.value)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-5">
              <div><span className="text-sm text-gray-600">Tổng thanh toán</span><strong className="ml-3 text-2xl text-red-600">{formatPrice(finalTotal)}</strong></div>
              <button type="button" disabled={placingOrder || !selectedAddressId} onClick={placeOrder} className="rounded bg-[#ffcf33] px-6 py-3 font-black text-[#14315f] disabled:bg-gray-200">{placingOrder ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
