import React, { useState } from 'react'
import { authService } from '../services/api'
import { useAuthStore } from '../services/store'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { imageUrl } from '../services/catalog'

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = () => {
    if (!form.full_name.trim()) return 'Vui lòng nhập họ tên.'
    if (!form.email.trim()) return 'Vui lòng nhập email.'
    if (form.password.length < 8) return 'Mật khẩu cần tối thiểu 8 ký tự.'
    if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận chưa khớp.'
    if (!accepted) return 'Vui lòng đồng ý với điều khoản tài khoản.'
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const message = validate()
    if (message) {
      setError(message)
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await authService.register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      })
      const { access_token, refresh_token } = response.data
      login(access_token, refresh_token, {
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
      })
      const me = await authService.getCurrentUser()
      login(access_token, refresh_token, me.data)
      window.location.href = '/'
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail === 'Email already registered' ? 'Email này đã được đăng ký.' : detail || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="bg-[#f6f7fb] py-10 md:py-14">
        <section className="container">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded bg-white shadow-xl lg:grid-cols-[0.95fr_1.05fr]">
            <div className="hidden bg-[#ffcf33] p-8 lg:grid lg:min-h-[650px] lg:grid-rows-[auto_1fr_auto]">
              <div className="text-[#14315f]">
                <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black">
                  ĐĂNG KÝ THÀNH VIÊN
                </p>
                <h1 className="mt-5 max-w-md text-4xl font-black leading-tight xl:text-5xl">
                  Tạo tài khoản để nhận ưu đãi riêng
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-[#24324f]">
                  Lưu địa chỉ giao hàng, theo dõi đơn hàng và mua sắm nhanh hơn trong những lần tiếp theo.
                </p>
              </div>

              <div className="mt-8 grid min-h-0 grid-cols-2 gap-5">
                <div className="overflow-hidden rounded bg-white shadow-lg">
                  <img
                    src={imageUrl('/uploads/products/vay-lien-co-duc.webp')}
                    alt="Thoi trang nu"
                    className="h-full min-h-[320px] w-full object-cover"
                  />
                </div>
                <div className="grid gap-5">
                  <div className="overflow-hidden rounded bg-white shadow-lg">
                    <img
                      src={imageUrl('/uploads/products/ao-polo-nam-regular.webp')}
                      alt="Ao polo nam"
                      className="h-[210px] w-full object-cover"
                    />
                  </div>
                  <div className="rounded bg-white p-5 shadow-lg">
                    <p className="text-sm font-bold text-gray-500">Quà tặng thành viên mới</p>
                    <p className="mt-1 text-3xl font-black text-red-600">Voucher 50K</p>
                    <p className="mt-1 text-sm text-gray-600">áp dụng cho đơn đầu tiên</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm font-bold text-[#14315f]">
                <div className="rounded bg-white/80 px-3 py-3">Nhận ưu đãi</div>
                <div className="rounded bg-white/80 px-3 py-3">Theo dõi đơn</div>
                <div className="rounded bg-white/80 px-3 py-3">Đổi trả dễ dàng</div>
              </div>
            </div>

            <div className="flex items-center px-5 py-8 sm:px-8 md:px-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-7">
                  <p className="text-sm font-black uppercase tracking-wide text-red-600">Bắt đầu mua sắm</p>
                  <h2 className="mt-2 text-3xl font-black text-[#14315f]">Đăng ký tài khoản</h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Tạo tài khoản Yody Demo để đăng nhập, lưu giỏ hàng và quản lý đơn hàng.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div>
                    <label htmlFor="full_name" className="mb-2 block text-sm font-black text-gray-800">
                      Họ và tên
                    </label>
                    <input
                      id="full_name"
                      value={form.full_name}
                      onChange={(event) => updateField('full_name', event.target.value)}
                      required
                      placeholder="Nguyen Van A"
                      className="min-h-[48px] w-full rounded border border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none transition focus:border-[#14315f] focus:bg-white focus:ring-4 focus:ring-[#14315f]/10"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-black text-gray-800">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        required
                        placeholder="ban@email.com"
                        className="min-h-[48px] w-full rounded border border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none transition focus:border-[#14315f] focus:bg-white focus:ring-4 focus:ring-[#14315f]/10"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-black text-gray-800">
                        Số điện thoại
                      </label>
                      <input
                        id="phone"
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder="090..."
                        className="min-h-[48px] w-full rounded border border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none transition focus:border-[#14315f] focus:bg-white focus:ring-4 focus:ring-[#14315f]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-black text-gray-800">
                      Mật khẩu
                    </label>
                    <div className="flex min-h-[48px] overflow-hidden rounded border border-gray-200 bg-gray-50 transition focus-within:border-[#14315f] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14315f]/10">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => updateField('password', event.target.value)}
                        required
                        placeholder="Tối thiểu 8 ký tự"
                        className="min-w-0 flex-1 bg-transparent px-4 text-gray-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="px-4 text-sm font-bold text-[#14315f] hover:bg-[#fff5cc]"
                      >
                        {showPassword ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-black text-gray-800">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(event) => updateField('confirmPassword', event.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu"
                      className="min-h-[48px] w-full rounded border border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none transition focus:border-[#14315f] focus:bg-white focus:ring-4 focus:ring-[#14315f]/10"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-gray-700">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#14315f]"
                    />
                    <span>
                      Tôi đồng ý tạo tài khoản và nhận thông tin ưu đãi từ Yody Demo.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-[50px] rounded bg-[#14315f] px-5 font-black text-white transition hover:bg-[#0d2448] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {loading ? 'Đang tạo tài khoản...' : 'Đăng ký và đăng nhập'}
                  </button>
                </form>

                <p className="mt-7 text-center text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <a href="/login" className="font-black text-[#14315f] hover:underline">
                    Đăng nhập
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
