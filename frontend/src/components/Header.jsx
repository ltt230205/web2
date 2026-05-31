import React, { useEffect, useMemo, useState } from 'react'
import { authService, productService } from '../services/api'
import { useAuthStore, useCartStore } from '../services/store'

const defaultNavItems = [
  {
    label: 'Nam',
    href: '/products?category_id=1',
    categoryId: 1,
    highlight: false,
    title: 'Thời trang nam',
    description: 'Polo, sơ mi, quần kaki và các item mặc hằng ngày.',
    columns: [
      ['Áo nam', 'Áo polo nam', 'Áo thun nam', 'Áo sơ mi nam', 'Áo khoác nam'],
      ['Quần nam', 'Quần jean nam', 'Quần kaki nam', 'Quần short nam', 'Quần thể thao'],
      ['Nổi bật', 'Hàng mới về', 'Bán chạy', 'Airycool', 'Công sở nam'],
    ],
  },
  {
    label: 'Nữ',
    href: '/products?category_id=2',
    categoryId: 2,
    highlight: false,
    title: 'Thời trang nữ',
    description: 'Trang phục thanh lịch, dễ phối và thoải mái cho mỗi ngày.',
    columns: [
      ['Áo nữ', 'Áo polo nữ', 'Áo thun nữ', 'Áo sơ mi nữ', 'Áo chống nắng'],
      ['Đầm và quần', 'Váy liền', 'Chân váy', 'Quần jean nữ', 'Quần dài nữ'],
      ['Gợi ý', 'Đi làm', 'Đi chơi', 'Mặc nhà', 'Sản phẩm mới'],
    ],
  },
  {
    label: 'Trẻ em',
    href: '/products?category_id=3',
    categoryId: 3,
    highlight: false,
    title: 'Thời trang trẻ em',
    description: 'Đồ trẻ em mềm mại, bền màu và dễ vận động.',
    columns: [
      ['Bé trai', 'Áo bé trai', 'Quần bé trai', 'Đồ bộ bé trai', 'Polo trẻ em'],
      ['Bé gái', 'Áo bé gái', 'Đầm bé gái', 'Chân váy bé gái', 'Đồ bộ bé gái'],
      ['Theo mùa', 'Mùa hè', 'Đi học', 'Đi chơi', 'Hàng sale'],
    ],
  },
  {
    label: 'Ưu đãi -50%',
    href: '/products?category_id=11',
    categoryId: 11,
    highlight: true,
    title: 'Ưu đãi đang diễn ra',
    description: 'Các sản phẩm giá tốt, sale theo combo và chương trình mới.',
    columns: [
      ['Sale nam', 'Polo nam sale', 'Quần nam sale', 'Áo thun nam sale', 'Hàng dưới 299K'],
      ['Sale nữ', 'Váy nữ sale', 'Áo nữ sale', 'Quần nữ sale', 'Hàng dưới 399K'],
      ['Mua nhanh', 'Bán chạy đang sale', 'Mua 2 giảm thêm', 'Freeship', 'Sắp hết hàng'],
    ],
  },
  {
    label: 'Đồng phục',
    href: '/products?category_id=4',
    categoryId: 4,
    highlight: false,
    title: 'Đồng phục doanh nghiệp',
    description: 'Giải pháp đồng phục polo, sơ mi và áo khoác cho đội nhóm.',
    columns: [
      ['Loại đồng phục', 'Đồng phục công ty', 'Đồng phục lớp', 'Đồng phục sự kiện', 'Đồng phục nhà hàng'],
      ['Dịch vụ', 'Tư vấn thiết kế', 'Bảng màu vải', 'In thêu logo', 'Báo giá nhanh'],
      ['Chất liệu', 'Cotton', 'Airycool', 'Cafe fabric', 'Thun co giãn'],
    ],
  },
  {
    label: 'Hàng mới về',
    href: '/products?category_id=12',
    categoryId: 12,
    highlight: false,
    title: 'Hàng mới về',
    description: 'Cập nhật những mẫu mới nhất trong bộ sưu tập hiện tại.',
    columns: [
      ['Bộ sưu tập', 'Everyday Basic', 'Business Casual', 'Sport nhẹ tênh', 'Gia đình'],
      ['Mới cho nam', 'Polo mới', 'Sơ mi mới', 'Quần mới', 'Phụ kiện mới'],
      ['Mới cho nữ', 'Váy mới', 'Áo mới', 'Quần mới', 'Đồ mặc nhà mới'],
    ],
  },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [categoryNames, setCategoryNames] = useState({})
  const [search, setSearch] = useState('')
  const { user, token, isAuthenticated, logout, setUser } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    logout: state.logout,
    setUser: state.setUser,
  }))
  const cartCount = useCartStore((state) => state.getItemCount())
  const canUseCart = user?.account_type === 'CUSTOMER'
  const navItems = useMemo(() => defaultNavItems.map((item) => ({
    ...item,
    label: categoryNames[item.categoryId] || item.label,
  })), [categoryNames])
  const activeItem = navItems.find((item) => item.label === activeMenu)
  const displayName = user?.full_name || user?.email || 'Tài khoản'
  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [displayName])

  useEffect(() => {
    productService.getCategories()
      .then((response) => setCategoryNames(Object.fromEntries(
        response.data.map((category) => [category.id, category.name]),
      )))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let ignore = false

    const loadCurrentUser = async () => {
      if (!token || (user?.id && user?.account_type)) return
      try {
        const response = await authService.getCurrentUser()
        if (!ignore) setUser(response.data)
      } catch (error) {
        logout()
      }
    }

    loadCurrentUser()
    return () => {
      ignore = true
    }
  }, [token, user?.id, setUser, logout])

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    window.location.href = '/'
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const value = search.trim()
    window.location.href = value ? `/products?search=${encodeURIComponent(value)}` : '/products'
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" onMouseLeave={() => setActiveMenu(null)}>
      <div className="bg-[#ffcf33] text-sm font-semibold text-[#242424]">
        <div className="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-2 px-4 py-2 xl:px-6">
          <span>FREESHIP đơn từ 498K - Đổi trả trong 15 ngày</span>
          <div className="hidden gap-5 md:flex">
            <a href="#">Cửa hàng</a>
            <a href="#">Tin tức</a>
            <a href="#">Tra cứu đơn</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1520px] px-4 xl:px-6">
        <div className="flex min-h-[76px] items-center gap-3 xl:gap-5">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded border border-gray-200 px-3 py-2 text-sm font-semibold lg:hidden"
            aria-expanded={open}
          >
            Menu
          </button>

          <a href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded bg-[#ffcf33] text-xl font-black text-[#14315f]">
              YD
            </span>
            <span className="whitespace-nowrap text-xl font-black tracking-wide text-[#14315f] xl:text-2xl">YODY DEMO</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-1 text-[14px] font-semibold text-gray-800 lg:flex xl:gap-2 xl:text-[15px]">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onMouseEnter={() => setActiveMenu(item.label)}
                onFocus={() => setActiveMenu(item.label)}
                className={`relative whitespace-nowrap rounded px-2 py-6 transition duration-200 xl:px-3 ${
                  item.highlight ? 'text-red-600 hover:text-red-700' : 'hover:text-[#14315f]'
                } ${activeMenu === item.label ? 'bg-[#fff5cc] text-[#14315f]' : ''}`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 bottom-3 h-0.5 origin-left rounded bg-[#ffcf33] transition-transform duration-200 ${
                    activeMenu === item.label ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden w-[220px] shrink-0 items-center rounded border border-gray-200 bg-gray-50 px-3 py-2 xl:flex 2xl:w-[280px]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button className="font-black text-[#14315f]">Tìm</button>
          </form>

          <div className="relative flex shrink-0 items-center gap-2 text-sm font-semibold xl:gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex items-center gap-2 rounded border border-gray-200 bg-white px-2 py-2 transition hover:border-[#ffcf33] hover:bg-[#fff5cc]"
                  aria-expanded={accountOpen}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#14315f] text-xs font-black text-white">
                    {initials || 'TK'}
                  </span>
                  <span className="hidden max-w-[112px] truncate text-left text-[#14315f] 2xl:block">
                    {displayName}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 bg-[#fff5cc] p-4">
                      <p className="text-sm font-black text-[#14315f]">{displayName}</p>
                      <p className="mt-1 truncate text-xs text-gray-600">{user?.email}</p>
                      {user?.phone && <p className="mt-1 text-xs text-gray-600">{user.phone}</p>}
                    </div>
                    <div className="grid p-2 text-sm">
                      {user?.account_type === 'ADMIN' && (
                        <a href="/admin" className="rounded px-3 py-2 font-black text-[#14315f] hover:bg-[#fff5cc]">
                          Quản trị website
                        </a>
                      )}
                      <a href="/account" className="rounded px-3 py-2 font-bold text-gray-700 hover:bg-gray-50">
                        Thông tin tài khoản
                      </a>
                      <a href="/account/orders" className="rounded px-3 py-2 font-bold text-gray-700 hover:bg-gray-50">
                        Đơn hàng của tôi
                      </a>
                      <a href="/account/addresses" className="rounded px-3 py-2 font-bold text-gray-700 hover:bg-gray-50">
                        Địa chỉ giao hàng
                      </a>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded px-3 py-2 text-left font-black text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="hidden hover:text-[#14315f] sm:inline">Đăng nhập</a>
            )}
            {canUseCart && (
              <a
                href={isAuthenticated ? '/cart' : '/login?redirect=/cart'}
                className="relative whitespace-nowrap rounded bg-[#14315f] px-4 py-2 text-white hover:bg-[#0d2448]"
              >
                Giỏ hàng
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </a>
            )}
          </div>
        </div>

        <form onSubmit={submitSearch} className="mb-4 hidden items-center rounded border border-gray-200 bg-gray-50 px-3 py-2 md:flex xl:hidden">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm sản phẩm..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          <button className="font-black text-[#14315f]">Tìm kiếm</button>
        </form>

        <div className={`${open ? 'grid' : 'hidden'} gap-4 border-t border-gray-100 py-4 lg:hidden`}>
          {navItems.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 font-bold text-[#14315f]">{group.title}</h3>
              <div className="grid gap-2 text-sm text-gray-600">
                {group.columns.flat().map((item) => (
                  <a key={item} href={group.href} className="hover:text-[#14315f]">{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        onMouseEnter={() => activeItem && setActiveMenu(activeItem.label)}
        className={`absolute left-0 right-0 top-full hidden border-t border-gray-100 bg-white shadow-xl transition duration-200 lg:block ${
          activeItem ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        {activeItem && (
          <div className="container grid gap-8 py-7 lg:grid-cols-[280px_1fr]">
            <div className="rounded bg-[#ffcf33] p-6 text-[#14315f]">
              <p className="text-sm font-black uppercase tracking-wide">Chủ đề đang chọn</p>
              <h2 className="mt-2 text-2xl font-black">{activeItem.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#24324f]">{activeItem.description}</p>
              <a href={activeItem.href} className="mt-5 inline-flex rounded bg-[#14315f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2448]">
                Xem tất cả
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {activeItem.columns.map((column) => (
                <div key={column[0]} className="rounded border border-gray-100 p-4 transition duration-200 hover:border-[#ffcf33] hover:shadow-md">
                  <h3 className="mb-3 font-black text-[#14315f]">{column[0]}</h3>
                  <div className="grid gap-2 text-sm text-gray-600">
                    {column.slice(1).map((item) => (
                      <a key={item} href={activeItem.href} className="rounded px-2 py-1 transition hover:bg-[#fff5cc] hover:text-[#14315f]">
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
