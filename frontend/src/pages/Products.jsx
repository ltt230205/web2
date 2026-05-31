import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { categories as fallbackCategories, fallbackProducts, formatPrice, imageUrl, normalizeProduct } from '../services/catalog'

function ProductCard({ product }) {
  return (
    <a href={`/products/${product.id}`} className="group block bg-white">
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-gray-100">
        <img
          src={imageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-sm bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-sm bg-white/95 px-3 py-1 text-xs font-bold text-[#14315f]">
          {product.tag}
        </span>
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold text-gray-800">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="font-bold text-red-600">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          {product.colors?.slice(0, 4).map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </a>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null
  const [products, setProducts] = useState(fallbackProducts)
  const [categories, setCategories] = useState(fallbackCategories)
  const [brands, setBrands] = useState([])
  const [filterOptions, setFilterOptions] = useState({ colors: [], sizes: [], genders: [] })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({ gender: '', brand_id: '', size_id: '', color_id: '', min_price: '', max_price: '' })
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 })

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null
    setSelectedCategory(categoryFromUrl)
  }, [searchParams])

  useEffect(() => {
    Promise.all([productService.getCategories(), productService.getBrands(), productService.getFilters()])
      .then(([categoryResponse, brandResponse, filterResponse]) => {
        setCategories([
          { id: null, name: 'Tất cả', label: 'Tất cả', parent_id: null },
          ...categoryResponse.data.map((category) => ({ ...category, label: category.name })),
        ])
        setBrands(brandResponse.data)
        setFilterOptions(filterResponse.data)
      })
      .catch(() => setCategories(fallbackCategories))
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await productService.getProducts({
          category_id: selectedCategory || undefined,
          search: search || undefined,
          ...filters,
          sort,
          page,
          page_size: 12,
        })
        const apiProducts = response.data.data || []
        setProducts(apiProducts.map(normalizeProduct))
        setPagination({ total: response.data.total, total_pages: response.data.total_pages })
      } catch (error) {
        const filtered = fallbackProducts.filter((product) => {
          const matchCategory = selectedCategory ? product.category_id === selectedCategory : true
          const matchSearch = product.name.toLowerCase().includes(search.toLowerCase())
          return matchCategory && matchSearch
        })
        setProducts(filtered)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedCategory, search, filters, sort, page])

  const countLabel = useMemo(() => `${pagination.total} sản phẩm`, [pagination.total])
  const selectedCategoryLabel = categories.find((cat) => cat.id === selectedCategory)?.label || 'Tất cả sản phẩm'

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId)
    setPage(1)
    if (categoryId) {
      setSearchParams({ category_id: String(categoryId) })
    } else {
      setSearchParams({})
    }
  }

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="border-b border-gray-100 bg-[#f6f7fb]">
          <div className="container py-8">
            <p className="text-sm font-semibold text-gray-500">Trang chủ / Sản phẩm</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-[#14315f]">{selectedCategoryLabel}</h1>
                <p className="mt-2 text-gray-600">Lọc nhanh theo danh mục, tìm sản phẩm và xem giá khuyến mãi.</p>
              </div>
              <span className="rounded bg-[#ffcf33] px-4 py-2 text-sm font-black text-[#14315f]">{countLabel}</span>
            </div>
          </div>
        </section>

        <section className="container py-8">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="lg:sticky lg:top-[140px] lg:self-start">
              <div className="rounded border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-black text-[#14315f]">Danh mục</h2>
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id ?? 'all'}
                      type="button"
                      onClick={() => selectCategory(cat.id)}
                      className={`rounded px-3 py-2 text-left text-sm font-bold ${cat.parent_id ? 'pl-6' : ''} ${
                        selectedCategory === cat.id
                          ? 'bg-[#ffcf33] text-[#14315f]'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 rounded border border-gray-200 bg-white p-5">
                <h2 className="text-lg font-black text-[#14315f]">Bộ lọc</h2>
                <select value={filters.gender} onChange={(event) => updateFilter('gender', event.target.value)} className="rounded border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Tất cả giới tính</option>
                  {filterOptions.genders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select value={filters.brand_id} onChange={(event) => updateFilter('brand_id', event.target.value)} className="rounded border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select value={filters.size_id} onChange={(event) => updateFilter('size_id', event.target.value)} className="rounded border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Tất cả kích cỡ</option>
                  {filterOptions.sizes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <select value={filters.color_id} onChange={(event) => updateFilter('color_id', event.target.value)} className="rounded border border-gray-200 px-3 py-2 text-sm">
                  <option value="">Tất cả màu sắc</option>
                  {filterOptions.colors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" value={filters.min_price} onChange={(event) => updateFilter('min_price', event.target.value)} placeholder="Giá từ" className="min-w-0 rounded border border-gray-200 px-3 py-2 text-sm" />
                  <input type="number" min="0" value={filters.max_price} onChange={(event) => updateFilter('max_price', event.target.value)} placeholder="Giá đến" className="min-w-0 rounded border border-gray-200 px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => setFilters({ gender: '', brand_id: '', size_id: '', color_id: '', min_price: '', max_price: '' })} className="rounded border border-gray-200 px-3 py-2 text-sm font-bold">
                  Xóa bộ lọc
                </button>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col gap-3 rounded border border-gray-200 bg-white p-4 md:flex-row">
                <input
                  type="text"
                  placeholder="Tìm áo polo, váy, hàng mới..."
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                  className="min-h-[44px] flex-1 rounded border border-gray-200 px-4 outline-none focus:border-[#14315f]"
                />
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="min-h-[44px] rounded border border-gray-200 px-4 font-semibold text-gray-700 outline-none">
                  <option value="featured">Sắp xếp nổi bật</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="best_selling">Bán chạy nhất</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="aspect-[3/4] animate-pulse rounded bg-gray-100" />
                  ))}
                </div>
              ) : products.length ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded border border-dashed border-gray-300 p-10 text-center">
                  <h2 className="font-black text-[#14315f]">Không tìm thấy sản phẩm</h2>
                  <p className="mt-2 text-gray-600">Thử tìm bằng từ khóa ngắn hơn hoặc chọn danh mục khác.</p>
                </div>
              )}
              {pagination.total_pages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {Array.from({ length: pagination.total_pages }, (_, index) => index + 1).map((number) => (
                    <button key={number} type="button" onClick={() => setPage(number)} className={`h-10 min-w-10 rounded px-3 font-black ${page === number ? 'bg-[#14315f] text-white' : 'border border-gray-200 bg-white'}`}>
                      {number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
