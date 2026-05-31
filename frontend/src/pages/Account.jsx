import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { addressFields, createEmptyAddress } from '../constants/checkout'
import { authService, customerService, orderService } from '../services/api'
import { formatPrice } from '../services/catalog'
import { useAuthStore } from '../services/store'

const statusLabels = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã hoàn hàng',
}

function AccountShell({ title, subtitle, children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) window.location.href = `/login?redirect=${window.location.pathname}`
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <>
      <Header />
      <main className="bg-[#f6f7fb]">
        <section className="border-b border-gray-100 bg-white">
          <div className="container py-8">
            <p className="text-sm font-semibold text-gray-500">Trang chủ / Tài khoản</p>
            <h1 className="mt-3 text-4xl font-black text-[#14315f]">{title}</h1>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </div>
        </section>
        <section className="container grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="rounded border border-gray-200 bg-white p-3 shadow-sm">
              {[
                ['Thông tin tài khoản', '/account'],
                ['Đơn hàng của tôi', '/account/orders'],
                ['Địa chỉ giao hàng', '/account/addresses'],
              ].map(([label, href]) => (
                <a key={href} href={href} className={`block rounded px-4 py-3 font-bold ${window.location.pathname === href ? 'bg-[#ffcf33] text-[#14315f]' : 'text-gray-700 hover:bg-gray-50'}`}>{label}</a>
              ))}
            </div>
          </aside>
          <div>{children}</div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function AccountInfo() {
  const { user, setUser } = useAuthStore((state) => ({ user: state.user, setUser: state.setUser }))
  const [profile, setProfile] = useState(user || {})
  const [message, setMessage] = useState('')

  useEffect(() => {
    authService.getCurrentUser()
      .then((response) => {
        setUser(response.data)
        setProfile(response.data)
      })
      .catch(() => setMessage('Không thể tải thông tin tài khoản.'))
  }, [setUser])

  return (
    <AccountShell title="Thông tin tài khoản" subtitle="Thông tin khách hàng đang dùng để đặt hàng.">
      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        {message && <div className="mb-5 rounded border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">{message}</div>}
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black">Họ và tên<input value={profile.full_name || ''} disabled className="min-h-[48px] rounded border border-gray-200 bg-gray-50 px-4" /></label>
          <label className="grid gap-2 text-sm font-black">Email<input value={profile.email || ''} disabled className="min-h-[48px] rounded border border-gray-200 bg-gray-50 px-4" /></label>
          <label className="grid gap-2 text-sm font-black">Số điện thoại<input value={profile.phone || ''} disabled className="min-h-[48px] rounded border border-gray-200 bg-gray-50 px-4" /></label>
          <label className="grid gap-2 text-sm font-black">Loại tài khoản<input value={profile.account_type || 'CUSTOMER'} disabled className="min-h-[48px] rounded border border-gray-200 bg-gray-50 px-4" /></label>
        </div>
      </div>
    </AccountShell>
  )
}

export function AccountOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const placed = new URLSearchParams(window.location.search).get('placed')

  useEffect(() => {
    orderService.getOrders()
      .then((response) => setOrders(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Không thể tải danh sách đơn hàng.'))
  }, [])

  const toggleOrder = async (orderId) => {
    if (expandedOrder?.id === orderId) {
      setExpandedOrder(null)
      return
    }
    try {
      setError('')
      const response = await orderService.getOrder(orderId)
      setExpandedOrder(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể tải chi tiết đơn hàng.')
    }
  }

  return (
    <AccountShell title="Đơn hàng của tôi" subtitle="Theo dõi các đơn hàng đã đặt trên website.">
      {placed && <div className="mb-5 rounded border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">Đặt hàng thành công. Mã đơn của bạn: {placed}</div>}
      {error && <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</div>}
      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <h2 className="text-2xl font-black text-[#14315f]">Bạn chưa có đơn hàng</h2>
            <a href="/products" className="mt-6 inline-flex rounded bg-[#14315f] px-6 py-3 font-black text-white">Mua sắm ngay</a>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded border border-gray-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#14315f]">{order.order_code}</p>
                    <p className="mt-1 text-sm text-gray-500">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <span className="rounded bg-[#fff5cc] px-3 py-1 text-sm font-black text-[#14315f]">{statusLabels[order.status] || order.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-3 text-sm">
                  <span>Thanh toán: {order.payment_status === 'UNPAID' ? 'Chưa thanh toán' : order.payment_status} ({order.payment_method || 'COD'})</span>
                  <strong className="text-red-600">{formatPrice(order.final_price)}</strong>
                </div>
                <button type="button" onClick={() => toggleOrder(order.id)} className="mt-3 text-sm font-black text-[#14315f] hover:underline">
                  {expandedOrder?.id === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
                {expandedOrder?.id === order.id && (
                  <div className="mt-4 grid gap-3 rounded bg-gray-50 p-4 text-sm">
                    {expandedOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-wrap justify-between gap-3 border-b border-gray-200 pb-2 last:border-0">
                        <span>{item.product_name} {item.variant_name ? `- ${item.variant_name}` : ''}</span>
                        <strong>{item.quantity} x {formatPrice(item.unit_price)}</strong>
                      </div>
                    ))}
                    <p><strong>Nhận hàng:</strong> {expandedOrder.receiver_name} - {expandedOrder.receiver_phone}</p>
                    <p><strong>Địa chỉ:</strong> {expandedOrder.shipping_address_line}, {expandedOrder.shipping_ward_name}, {expandedOrder.shipping_district_name}, {expandedOrder.shipping_province_name}</p>
                    {expandedOrder.discount_amount > 0 && <p><strong>Giảm giá:</strong> -{formatPrice(expandedOrder.discount_amount)}</p>}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  )
}

export function AccountAddresses() {
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(createEmptyAddress)
  const [error, setError] = useState('')

  const loadAddresses = () => {
    customerService.getAddresses()
      .then((response) => setAddresses(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Không thể tải địa chỉ giao hàng.'))
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const addAddress = async (event) => {
    event.preventDefault()
    try {
      setError('')
      await customerService.createAddress(form)
      setForm(createEmptyAddress())
      loadAddresses()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể lưu địa chỉ.')
    }
  }

  const removeAddress = async (id) => {
    if (!window.confirm('Xóa địa chỉ giao hàng này?')) return
    try {
      setError('')
      await customerService.deleteAddress(id)
      loadAddresses()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể xóa địa chỉ.')
    }
  }

  return (
    <AccountShell title="Địa chỉ giao hàng" subtitle="Lưu địa chỉ thường dùng để đặt hàng nhanh hơn.">
      <div className="grid gap-6">
        {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</div>}
        <form onSubmit={addAddress} className="rounded border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#14315f]">Thêm địa chỉ mới</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {addressFields.map(([field, placeholder]) => (
              <input key={field} required value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={placeholder} className="min-h-[48px] rounded border border-gray-200 px-4 outline-none focus:border-[#14315f]" />
            ))}
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-bold">
            <input type="checkbox" checked={form.is_default} onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))} />
            Đặt làm địa chỉ mặc định
          </label>
          <button className="mt-5 rounded bg-[#14315f] px-6 py-3 font-black text-white">Lưu địa chỉ</button>
        </form>
        <div className="grid gap-4">
          {addresses.map((address) => (
            <article key={address.id} className="rounded border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-black text-[#14315f]">{address.receiver_name} {address.is_default ? '(Mặc định)' : ''}</p>
                  <p className="mt-1 text-sm text-gray-600">{address.receiver_phone}</p>
                  <p className="mt-2 text-gray-700">{address.address_line}, {address.ward_name}, {address.district_name}, {address.province_name}</p>
                </div>
                <button type="button" onClick={() => removeAddress(address.id)} className="rounded border border-red-200 px-4 py-2 font-black text-red-600">Xóa</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AccountShell>
  )
}
