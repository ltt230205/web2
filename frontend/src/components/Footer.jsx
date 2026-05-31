import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-0 bg-[#14315f] text-white">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <h3 className="text-2xl font-black">YODY DEMO</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100">
              Website bán hàng thời trang demo, lấy cảm hứng từ trải nghiệm mua sắm nhanh,
              rõ danh mục và nhấn mạnh sản phẩm ưu đãi.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-black">Mua sắm</h4>
            <div className="grid gap-2 text-sm text-blue-100">
              <a href="/products">Nam</a>
              <a href="/products">Nữ</a>
              <a href="/products">Trẻ em</a>
              <a href="/products">Đồng phục</a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-black">Hỗ trợ</h4>
            <div className="grid gap-2 text-sm text-blue-100">
              <a href="#">Chính sách đổi trả</a>
              <a href="#">Hướng dẫn chọn size</a>
              <a href="#">Vận chuyển</a>
              <a href="#">Liên hệ</a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-black">Nhận tin khuyến mãi</h4>
            <div className="flex overflow-hidden rounded bg-white">
              <input className="min-w-0 flex-1 px-4 py-3 text-sm text-gray-800 outline-none" placeholder="Email của bạn" />
              <button className="bg-[#ffcf33] px-4 text-sm font-black text-[#14315f]">Gửi</button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/15 pt-6 text-sm text-blue-100">
          Copyright 2026 Yody Demo. Built for fashion e-commerce practice.
        </div>
      </div>
    </footer>
  )
}
