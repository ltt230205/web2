import React, { useState } from 'react'
import { authService } from '../services/api'
import { useAuthStore } from '../services/store'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { imageUrl } from '../services/catalog'

export default function Login() {
  const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login(email, password)
      const { access_token, refresh_token } = response.data
      login(access_token, refresh_token, { email })
      const me = await authService.getCurrentUser()
      login(access_token, refresh_token, me.data)
      window.location.href = redirectTo === '/' && me.data.account_type === 'ADMIN' ? '/admin' : redirectTo
    } catch (err) {
      setError(err.response?.data?.detail || 'Email hoặc mật khẩu chưa đúng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="bg-[#f6f7fb] py-10 md:py-14">
        <section className="container">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded bg-white shadow-xl lg:grid-cols-[0.9fr_1fr]">
            <div className="hidden bg-[#ffcf33] p-8 lg:grid lg:min-h-[590px] lg:grid-rows-[auto_1fr_auto]">
              <div className="text-[#14315f]">
                <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black">
                  THÀNH VIÊN YODY DEMO
                </p>
                <h1 className="mt-5 max-w-md text-4xl font-black leading-tight xl:text-5xl">
                  Đăng nhập để mua sắm nhanh hơn
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-[#24324f]">
                  Theo dõi đơn hàng, lưu địa chỉ giao hàng và nhận ưu đãi riêng cho tài khoản của bạn.
                </p>
              </div>

              <div className="mt-8 grid min-h-0 grid-cols-2 gap-5">
                <div className="overflow-hidden rounded bg-white shadow-lg">
                  <img
                    src={imageUrl('/uploads/products/ao-polo-nu-regular.webp')}
                    alt="Ao polo nu"
                    className="h-full min-h-[280px] w-full object-cover"
                  />
                </div>
                <div className="grid gap-5">
                  <div className="overflow-hidden rounded bg-white shadow-lg">
                    <img
                      src={imageUrl('/uploads/products/ao-polo-nam-slim.webp')}
                      alt="Ao polo nam"
                      className="h-[190px] w-full object-cover"
                    />
                  </div>
                  <div className="rounded bg-white p-5 shadow-lg">
                    <p className="text-sm font-bold text-gray-500">Ưu đãi thành viên</p>
                    <p className="mt-1 text-3xl font-black text-red-600">-15%</p>
                    <p className="mt-1 text-sm text-gray-600">cho đơn hàng đầu tiên</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-sm font-bold text-[#14315f]">
                <div className="rounded bg-white/80 px-3 py-3">Đổi trả 15 ngày</div>
                <div className="rounded bg-white/80 px-3 py-3">Freeship 498K</div>
                <div className="rounded bg-white/80 px-3 py-3">Ưu đãi riêng</div>
              </div>
            </div>

            <div className="flex items-center px-5 py-8 sm:px-8 md:px-12">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8">
                  <p className="text-sm font-black uppercase tracking-wide text-red-600">Xin chào trở lại</p>
                  <h2 className="mt-2 text-3xl font-black text-[#14315f]">Đăng nhập tài khoản</h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Nhập thông tin để tiếp tục mua sắm và quản lý đơn hàng của bạn.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-5">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-black text-gray-800">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="ban@email.com"
                      className="min-h-[48px] w-full rounded border border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none transition focus:border-[#14315f] focus:bg-white focus:ring-4 focus:ring-[#14315f]/10"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label htmlFor="password" className="block text-sm font-black text-gray-800">
                      Mật khẩu
                      </label>
                      <a href="#" className="text-sm font-bold text-[#14315f] hover:underline">
                        Quên mật khẩu?
                      </a>
                    </div>
                    <div className="flex min-h-[48px] overflow-hidden rounded border border-gray-200 bg-gray-50 transition focus-within:border-[#14315f] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#14315f]/10">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        placeholder="Nhập mật khẩu"
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

                  <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 accent-[#14315f]"
                    />
                    Ghi nhớ đăng nhập trên thiết bị này
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-[50px] rounded bg-[#14315f] px-5 font-black text-white transition hover:bg-[#0d2448] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>

                <div className="my-7 flex items-center gap-3 text-sm text-gray-400">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span>hoặc tiếp tục với</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="min-h-[46px] rounded border border-gray-200 bg-white font-bold text-gray-700 transition hover:border-[#ffcf33] hover:bg-[#fff5cc]">
                    Google
                  </button>
                  <button className="min-h-[46px] rounded border border-gray-200 bg-white font-bold text-gray-700 transition hover:border-[#ffcf33] hover:bg-[#fff5cc]">
                    Facebook
                  </button>
                </div>

                <p className="mt-7 text-center text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <a href="/register" className="font-black text-[#14315f] hover:underline">
                    Đăng ký ngay
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
