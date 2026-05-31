import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/api'
import { fallbackProducts, imageUrl, normalizeProduct } from '../services/catalog'

const categoryTiles = [
  { title: 'Thời trang nam', href: '/products?category_id=1', image: '/uploads/products/ao-polo-nam-regular.webp' },
  { title: 'Thời trang nữ', href: '/products?category_id=2', image: '/uploads/products/vay-lien-co-duc.webp' },
  { title: 'Trẻ em', href: '/products?category_id=3', image: '/uploads/products/ao-polo-nu-regular.webp' },
  { title: 'Hàng mới về', href: '/products?category_id=12', image: '/uploads/products/ao-polo-nam-slim.webp' },
]

export default function Home() {
  const [products, setProducts] = useState(fallbackProducts)

  useEffect(() => {
    productService.getProducts({ page: 1, page_size: 12, sort: 'featured' })
      .then((response) => setProducts((response.data.data || []).map(normalizeProduct)))
      .catch(() => setProducts(fallbackProducts))
  }, [])

  const heroProducts = products.slice(0, 3)
  const bestSelling = products.slice(0, 8)
  const newProducts = [...products].reverse().slice(0, 4)

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="bg-[#ffcf33]">
          <div className="container grid min-h-[520px] items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-xl">
              <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#14315f]">
                BST THE NEW T-MATE
              </p>
              <h1 className="text-4xl font-black leading-tight text-[#14315f] md:text-6xl">
                Mặc đẹp mỗi ngày, giá tốt như Yody
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#24324f]">
                Giao diện bán hàng thời trang với banner lớn, danh mục rõ ràng, card sản phẩm
                có giá sale và trải nghiệm mua sắm nhanh trên mọi thiết bị.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/products" className="rounded bg-[#14315f] px-7 py-3 font-bold text-white hover:bg-[#0d2448]">
                  Mua ngay
                </a>
                <a href="/products" className="rounded border border-[#14315f] px-7 py-3 font-bold text-[#14315f] hover:bg-white">
                  Xem hàng mới
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {heroProducts.map((product, index) => (
                <div key={product.id} className={index === 1 ? 'mt-10' : ''}>
                  <div className="overflow-hidden rounded bg-white shadow-lg">
                    <img src={imageUrl(product.image)} alt={product.name} className="aspect-[3/4] w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categoryTiles.map((tile) => (
              <a key={tile.title} href={tile.href} className="group relative overflow-hidden rounded bg-gray-100">
                <img src={imageUrl(tile.image)} alt={tile.title} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
                  <h2 className="text-lg font-black text-white">{tile.title}</h2>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-[#f6f7fb] py-12">
          <div className="container">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="font-bold text-red-600">Ưu đãi nổi bật</p>
                <h2 className="text-3xl font-black text-[#14315f]">Sản phẩm bán chạy</h2>
              </div>
              <a href="/products" className="font-bold text-[#14315f] hover:underline">Xem thêm</a>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {bestSelling.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-red-600">Phong cách mới mỗi tuần</p>
              <h2 className="text-3xl font-black text-[#14315f]">Hàng mới về</h2>
            </div>
            <a href="/products?sort=newest" className="font-bold text-[#14315f] hover:underline">Khám phá ngay</a>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {newProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="bg-[#f7efe7] py-12">
          <div className="container grid gap-5 md:grid-cols-3">
            {[
              ['Lan Anh', 'Giao hàng nhanh, áo mặc đúng form và chất vải dễ chịu.'],
              ['Minh Quân', 'Bộ lọc size và màu rõ ràng, đặt hàng trên điện thoại rất thuận tiện.'],
              ['Thu Hà', 'Shop tư vấn nhanh, đóng gói chỉn chu và theo dõi đơn dễ dàng.'],
            ].map(([name, content]) => (
              <article key={name} className="rounded bg-white p-6 shadow-sm">
                <p className="text-lg text-[#d49b35]">★★★★★</p>
                <p className="mt-3 leading-7 text-gray-700">“{content}”</p>
                <p className="mt-4 font-black text-[#14315f]">{name}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container grid gap-5 py-12 md:grid-cols-3">
          {[
            ['Đổi trả 15 ngày', 'Áp dụng cho sản phẩm còn tem mác và hóa đơn mua hàng.'],
            ['Tư vấn kích cỡ', 'Bảng size rõ ràng, gợi ý form dáng theo nhu cầu mặc.'],
            ['Nhận hàng tại nhà', 'Đóng gói nhanh, theo dõi đơn hàng trực tiếp trên website.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-black text-[#14315f]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}
