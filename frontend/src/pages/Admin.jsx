import React, { useEffect, useMemo, useState } from 'react'
import { adminService, productService } from '../services/api'
import { formatPrice, imageUrl, normalizeProduct } from '../services/catalog'
import { useAuthStore } from '../services/store'

const sections = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'products', label: 'Sản phẩm' },
  { id: 'inventory', label: 'Tồn kho' },
  { id: 'categories', label: 'Danh mục' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'customers', label: 'Khách hàng' },
  { id: 'discounts', label: 'Mã giảm giá' },
]

const emptyProduct = {
  product_code: '',
  name: '',
  slug: '',
  brand_id: '1',
  category_ids: [],
  short_description: '',
  description: '',
  material: '',
  care_instruction: '',
  gender_target: 'UNISEX',
  status: 'ACTIVE',
  is_featured: false,
  min_price: '',
  max_price: '',
  image_url: '',
}

const orderStatusLabels = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Giao hàng thành công',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã hoàn hàng',
}

const emptyCategory = { name: '', slug: '', parent_id: '', sort_order: 0, status: 'ACTIVE' }
const emptyDiscount = {
  code: '', name: '', discount_type: 'PERCENT', discount_value: 10,
  min_order_amount: 0, max_discount_amount: '', usage_limit: '', status: 'ACTIVE',
}

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

function StatCard({ label, value }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#14315f]">{value}</p>
    </div>
  )
}

function OrderManagement({ orders, onUpdateStatus, updatingOrderId }) {
  if (!orders.length) {
    return <p className="rounded bg-white p-5 shadow-sm">Chưa có đơn hàng.</p>
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => {
        const updating = updatingOrderId === order.id
        return (
          <article key={order.id} className="rounded border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-black text-[#14315f]">{order.order_code}</p>
                <p className="mt-1 text-sm text-gray-500">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                <p className="mt-2 font-bold">{order.receiver_name} - {order.receiver_phone}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {order.shipping_address_line}, {order.shipping_ward_name}, {order.shipping_district_name}, {order.shipping_province_name}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex rounded bg-[#fff5cc] px-3 py-1 text-sm font-black text-[#14315f]">
                  {orderStatusLabels[order.status] || order.status}
                </span>
                <p className="mt-3 font-black text-red-600">{formatPrice(order.final_price)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex flex-wrap justify-between gap-3 text-sm">
                  <span>{item.product_name}{item.variant_name ? ` - ${item.variant_name}` : ''}</span>
                  <strong>{item.quantity} x {formatPrice(item.unit_price)}</strong>
                </div>
              ))}
            </div>

            {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'SHIPPING') && (
              <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                  <>
                    <button type="button" disabled={updating} onClick={() => onUpdateStatus(order, 'CANCELLED')} className="rounded border border-red-200 px-4 py-2 font-bold text-red-600 disabled:opacity-50">
                      Hủy đơn
                    </button>
                    <button type="button" disabled={updating} onClick={() => onUpdateStatus(order, 'PICKED_UP')} className="rounded bg-[#14315f] px-4 py-2 font-black text-white disabled:bg-gray-400">
                      Xác nhận đã lấy hàng
                    </button>
                  </>
                )}
                {order.status === 'SHIPPING' && (
                  <button type="button" disabled={updating} onClick={() => onUpdateStatus(order, 'DELIVERED')} className="rounded bg-green-600 px-4 py-2 font-black text-white disabled:bg-gray-400">
                    Xác nhận giao hàng thành công
                  </button>
                )}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function CategoryManagement({ categories, onSave, onDelete }) {
  const [form, setForm] = useState(emptyCategory)
  const [editingId, setEditingId] = useState(null)
  const edit = (category) => {
    setEditingId(category.id)
    setForm({ ...category, parent_id: category.parent_id || '' })
  }
  const submit = async (event) => {
    event.preventDefault()
    await onSave(editingId, form)
    setEditingId(null)
    setForm(emptyCategory)
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="rounded border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#14315f]">{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
        <div className="mt-4 grid gap-3">
          <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} placeholder="Tên danh mục" className="rounded border border-gray-200 px-4 py-3" />
          <input required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" className="rounded border border-gray-200 px-4 py-3" />
          <select value={form.parent_id} onChange={(event) => setForm((current) => ({ ...current, parent_id: event.target.value }))} className="rounded border border-gray-200 px-4 py-3">
            <option value="">Danh mục gốc</option>
            {categories.filter((item) => item.id !== editingId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button className="rounded bg-[#14315f] px-4 py-3 font-black text-white">{editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyCategory) }} className="rounded border border-gray-200 px-4 py-3 font-bold">Hủy sửa</button>}
        </div>
      </form>
      <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 last:border-0">
            <div><p className="font-black text-[#14315f]">{category.name}</p><p className="text-xs text-gray-500">{category.slug} {category.status === 'INACTIVE' ? '- Đã ẩn' : ''}</p></div>
            <div className="flex gap-2">
              <button type="button" onClick={() => edit(category)} className="rounded border border-gray-200 px-3 py-2 text-sm font-bold">Sửa</button>
              <button type="button" onClick={() => onDelete(category)} className="rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Ẩn</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InventoryManagement({ inventory, onUpdate }) {
  const [drafts, setDrafts] = useState({})
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-[#14315f]"><tr><th className="p-3">Sản phẩm / SKU</th><th className="p-3">Kho</th><th className="p-3">Đang giữ</th><th className="p-3">Khả dụng</th><th className="p-3">Cập nhật tồn</th></tr></thead>
        <tbody>{inventory.map((item) => (
          <tr key={item.id} className="border-t border-gray-100">
            <td className="p-3"><strong>{item.product_name}</strong><span className="block text-xs text-gray-500">{item.sku_code} - {item.variant_name}</span></td>
            <td className="p-3">{item.qty_on_hand}</td><td className="p-3">{item.qty_reserved}</td><td className="p-3 font-black">{item.qty_available}</td>
            <td className="p-3"><div className="flex gap-2"><input type="number" min={item.qty_reserved} value={drafts[item.id] ?? item.qty_on_hand} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} className="w-24 rounded border border-gray-200 px-3 py-2" /><button type="button" onClick={() => onUpdate(item.id, drafts[item.id] ?? item.qty_on_hand)} className="rounded bg-[#14315f] px-3 py-2 font-bold text-white">Lưu</button></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function CustomerManagement({ customers }) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-[#14315f]"><tr><th className="p-3">Khách hàng</th><th className="p-3">Liên hệ</th><th className="p-3">Đơn hàng</th><th className="p-3">Đã chi tiêu</th><th className="p-3">Trạng thái</th></tr></thead>
        <tbody>{customers.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="p-3 font-bold">{item.full_name || 'Chưa cập nhật'}</td><td className="p-3">{item.email}<span className="block text-xs text-gray-500">{item.phone}</span></td><td className="p-3">{item.order_count}</td><td className="p-3 font-black text-red-600">{formatPrice(item.total_spent)}</td><td className="p-3">{item.status}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function DiscountManagement({ discounts, onSave, onDelete }) {
  const [form, setForm] = useState(emptyDiscount)
  const [editingId, setEditingId] = useState(null)
  const edit = (item) => { setEditingId(item.id); setForm({ ...item, max_discount_amount: item.max_discount_amount || '', usage_limit: item.usage_limit || '' }) }
  const submit = async (event) => { event.preventDefault(); await onSave(editingId, form); setEditingId(null); setForm(emptyDiscount) }
  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="rounded border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#14315f]">{editingId ? 'Sửa mã ưu đãi' : 'Thêm mã ưu đãi'}</h2>
        <div className="mt-4 grid gap-3">
          <input required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Mã giảm giá" className="rounded border border-gray-200 px-4 py-3 uppercase" />
          <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Tên chương trình" className="rounded border border-gray-200 px-4 py-3" />
          <select value={form.discount_type} onChange={(event) => setForm((current) => ({ ...current, discount_type: event.target.value }))} className="rounded border border-gray-200 px-4 py-3"><option value="PERCENT">Giảm theo %</option><option value="FIXED">Giảm số tiền cố định</option></select>
          <input required type="number" min="0" value={form.discount_value} onChange={(event) => setForm((current) => ({ ...current, discount_value: event.target.value }))} placeholder="Giá trị giảm" className="rounded border border-gray-200 px-4 py-3" />
          <input type="number" min="0" value={form.min_order_amount} onChange={(event) => setForm((current) => ({ ...current, min_order_amount: event.target.value }))} placeholder="Đơn tối thiểu" className="rounded border border-gray-200 px-4 py-3" />
          <input type="number" min="0" value={form.max_discount_amount} onChange={(event) => setForm((current) => ({ ...current, max_discount_amount: event.target.value }))} placeholder="Giảm tối đa" className="rounded border border-gray-200 px-4 py-3" />
          <button className="rounded bg-[#14315f] px-4 py-3 font-black text-white">Lưu mã giảm giá</button>
        </div>
      </form>
      <div className="grid content-start gap-3">
        {discounts.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-white p-4 shadow-sm"><div><p className="font-black text-[#14315f]">{item.code} - {item.name}</p><p className="mt-1 text-sm text-gray-500">{item.discount_type === 'PERCENT' ? `${item.discount_value}%` : formatPrice(item.discount_value)} | Đã dùng {item.used_count}{item.status === 'INACTIVE' ? ' | Đã tắt' : ''}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(item)} className="rounded border border-gray-200 px-3 py-2 text-sm font-bold">Sửa</button><button type="button" onClick={() => onDelete(item)} className="rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-600">Tắt</button></div></div>)}
      </div>
    </div>
  )
}

function ProductForm({ brands, categories, form, mode, onChange, onClose, onSubmit, onToggleCategory, onUpload, saving, uploading }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl rounded bg-white p-5 shadow-2xl md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-500">Quản lý sản phẩm</p>
            <h2 className="text-2xl font-black text-[#14315f]">
              {mode === 'create' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-gray-200 px-4 py-2 font-bold">
            Đóng
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Mã sản phẩm
            <input required value={form.product_code} onChange={(event) => onChange('product_code', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Tên sản phẩm
            <input required value={form.name} onChange={(event) => onChange('name', event.target.value, true)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Đường dẫn (slug)
            <input required value={form.slug} onChange={(event) => onChange('slug', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <div className="grid gap-2 text-sm font-bold md:col-span-2">
            <span>Danh mục</span>
            <div className="grid max-h-48 gap-2 overflow-y-auto rounded border border-gray-200 p-3 md:grid-cols-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 rounded px-2 py-1 font-semibold hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.category_ids.map(String).includes(String(category.id))}
                    onChange={(event) => onToggleCategory(category.id, event.target.checked)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
            {!form.category_ids.length && <span className="text-xs text-red-600">Chọn ít nhất một danh mục.</span>}
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Thương hiệu
            <select value={form.brand_id} onChange={(event) => onChange('brand_id', event.target.value)} className="rounded border border-gray-200 px-4 py-3">
              <option value="">Không có thương hiệu</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Đối tượng
            <select value={form.gender_target} onChange={(event) => onChange('gender_target', event.target.value)} className="rounded border border-gray-200 px-4 py-3">
              <option value="UNISEX">Nam và nữ</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="KIDS">Trẻ em</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Giá bán
            <input required min="0" type="number" value={form.min_price} onChange={(event) => onChange('min_price', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Giá so sánh
            <input required min="0" type="number" value={form.max_price} onChange={(event) => onChange('max_price', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            URL ảnh đại diện
            <input value={form.image_url} onChange={(event) => onChange('image_url', event.target.value)} placeholder="/uploads/products/ten-anh.webp" className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Upload ảnh sản phẩm
            <input type="file" accept="image/*" disabled={uploading} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} className="rounded border border-gray-200 px-4 py-3" />
            {uploading && <span className="text-xs text-gray-500">Đang upload ảnh...</span>}
          </label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Mô tả ngắn
            <input value={form.short_description} onChange={(event) => onChange('short_description', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold md:col-span-2">
            Mô tả chi tiết
            <textarea rows="4" value={form.description} onChange={(event) => onChange('description', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Chất liệu
            <input value={form.material} onChange={(event) => onChange('material', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Hướng dẫn bảo quản
            <input value={form.care_instruction} onChange={(event) => onChange('care_instruction', event.target.value)} className="rounded border border-gray-200 px-4 py-3" />
          </label>
          <label className="flex items-center gap-3 text-sm font-bold">
            <input type="checkbox" checked={form.is_featured} onChange={(event) => onChange('is_featured', event.target.checked)} />
            Sản phẩm nổi bật
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded border border-gray-200 px-5 py-3 font-bold">Hủy</button>
          <button disabled={saving} className="rounded bg-[#14315f] px-5 py-3 font-black text-white disabled:bg-gray-400">
            {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Admin() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState({ products: 0, customers: 0, admins: 0, orders: 0 })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [customers, setCustomers] = useState([])
  const [inventory, setInventory] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [formMode, setFormMode] = useState('create')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }))

  const loadData = async () => {
    try {
      setError('')
      const [dashboard, productResponse, categoryResponse, brandResponse, orderResponse, customerResponse, inventoryResponse, discountResponse] = await Promise.all([
        adminService.getDashboard(),
        productService.getProducts({ page: 1, page_size: 100 }),
        adminService.getCategories(),
        productService.getBrands(),
        adminService.getOrders(),
        adminService.getCustomers(),
        adminService.getInventory(),
        adminService.getDiscountCodes(),
      ])
      setStats(dashboard.data)
      setProducts((productResponse.data.data || []).map(normalizeProduct))
      setCategories(categoryResponse.data)
      setBrands(brandResponse.data)
      setOrders(orderResponse.data)
      setCustomers(customerResponse.data)
      setInventory(inventoryResponse.data)
      setDiscounts(discountResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể tải dữ liệu quản trị.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
  }, [products, query])

  const openCreate = () => {
    setForm({ ...emptyProduct, brand_id: brands[0]?.id || '1' })
    setFormMode('create')
    setEditingId(null)
  }

  const openEdit = async (productId) => {
    try {
      setError('')
      const response = await productService.getProduct(productId)
      const product = response.data
      setForm({
        product_code: product.product_code || '',
        name: product.name || '',
        slug: product.slug || '',
        brand_id: product.brand?.id || '',
        category_ids: (product.categories || []).map((category) => category.id),
        short_description: product.short_description || '',
        description: product.description || '',
        material: product.material || '',
        care_instruction: product.care_instruction || '',
        gender_target: product.gender_target || 'UNISEX',
        status: 'ACTIVE',
        is_featured: Boolean(product.is_featured),
        min_price: product.price || '',
        max_price: product.compare_at_price || product.price || '',
        image_url: product.image || '',
      })
      setEditingId(productId)
      setFormMode('edit')
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể tải thông tin sản phẩm.')
    }
  }

  const updateForm = (field, value, updateSlug = false) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(updateSlug && !current.slug ? { slug: slugify(value) } : {}),
    }))
  }

  const toggleCategory = (categoryId, checked) => {
    setForm((current) => ({
      ...current,
      category_ids: checked
        ? [...new Set([...current.category_ids, categoryId])]
        : current.category_ids.filter((id) => String(id) !== String(categoryId)),
    }))
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      if (formMode === 'create') await adminService.createProduct(form)
      else await adminService.updateProduct(editingId, form)
      setForm(null)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể lưu sản phẩm.')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}" khỏi website?`)) return
    try {
      setError('')
      await adminService.deleteProduct(product.id)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể xóa sản phẩm.')
    }
  }

  const uploadProductImage = async (file) => {
    try {
      setUploading(true)
      setError('')
      const response = await adminService.uploadProductImage(file)
      updateForm('image_url', response.data.image_url)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể upload ảnh sản phẩm.')
    } finally {
      setUploading(false)
    }
  }

  const updateOrderStatus = async (order, action) => {
    const messages = {
      PICKED_UP: `Xác nhận đã lấy đơn ${order.order_code} để giao?`,
      DELIVERED: `Xác nhận đơn ${order.order_code} đã giao thành công và trừ sản phẩm khỏi tồn kho?`,
      CANCELLED: `Hủy đơn ${order.order_code} và hoàn trả số lượng đang giữ trong kho?`,
    }
    if (!window.confirm(messages[action])) return
    try {
      setUpdatingOrderId(order.id)
      setError('')
      await adminService.updateOrderStatus(order.id, action)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể cập nhật trạng thái đơn hàng.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const saveCategory = async (id, data) => {
    try {
      setError('')
      if (id) await adminService.updateCategory(id, data)
      else await adminService.createCategory(data)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Không thể lưu danh mục.')
    }
  }

  const deleteCategory = async (category) => {
    if (!window.confirm(`Ẩn danh mục "${category.name}" khỏi website?`)) return
    try { await adminService.deleteCategory(category.id); await loadData() } catch (requestError) { setError(requestError.response?.data?.detail || 'Không thể ẩn danh mục.') }
  }

  const updateInventory = async (id, quantity) => {
    try { setError(''); await adminService.updateInventory(id, Number(quantity)); await loadData() } catch (requestError) { setError(requestError.response?.data?.detail || 'Không thể cập nhật tồn kho.') }
  }

  const saveDiscount = async (id, data) => {
    try { setError(''); if (id) await adminService.updateDiscountCode(id, data); else await adminService.createDiscountCode(data); await loadData() } catch (requestError) { setError(requestError.response?.data?.detail || 'Không thể lưu mã giảm giá.') }
  }

  const deleteDiscount = async (item) => {
    if (!window.confirm(`Tắt mã giảm giá ${item.code}?`)) return
    try { await adminService.deleteDiscountCode(item.id); await loadData() } catch (requestError) { setError(requestError.response?.data?.detail || 'Không thể tắt mã giảm giá.') }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-[#14315f] text-white">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xl font-black">YODY DEMO</p>
          <p className="mt-1 text-xs text-blue-100">Trung tâm quản trị</p>
        </div>
        <nav className="grid gap-1 p-4">
          {sections.map((section) => (
            <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`rounded px-4 py-3 text-left font-bold ${activeSection === section.id ? 'bg-[#ffcf33] text-[#14315f]' : 'hover:bg-white/10'}`}>
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-5 lg:px-8">
          <div>
            <p className="text-sm font-bold text-gray-500">Quản trị website bán hàng</p>
            <h1 className="text-2xl font-black text-[#14315f]">{sections.find((section) => section.id === activeSection)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/?view=store" className="rounded border border-gray-200 px-4 py-2 text-sm font-bold">Mở website</a>
            <span className="rounded bg-[#ffcf33] px-4 py-2 text-sm font-black text-[#14315f]">{user?.full_name || user?.email}</span>
            <button type="button" onClick={handleLogout} className="rounded bg-red-600 px-4 py-2 text-sm font-black text-white">Đăng xuất</button>
          </div>
        </header>

        <div className="p-5 lg:p-8">
          {error && <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</div>}

          {activeSection === 'dashboard' && (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Doanh thu" value={formatPrice(stats.revenue || 0)} />
                <StatCard label="Đơn hàng" value={stats.orders} />
                <StatCard label="Chờ xử lý" value={stats.pending_orders || 0} />
                <StatCard label="Sản phẩm" value={stats.products} />
                <StatCard label="Khách hàng" value={stats.customers} />
                <StatCard label="Quản trị viên" value={stats.admins} />
              </div>
              <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[#14315f]">Sản phẩm bán chạy</h2>
                <div className="mt-4 grid gap-3">{stats.best_selling?.length ? stats.best_selling.map((item) => <div key={item.name} className="flex justify-between border-b border-gray-100 pb-2"><span>{item.name}</span><strong>{item.quantity} sản phẩm</strong></div>) : <p className="text-gray-500">Chưa có đơn hoàn thành để thống kê.</p>}</div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-[#14315f]">Doanh thu theo ngày</h2>
                  <div className="mt-4 grid gap-3">{stats.daily_revenue?.length ? stats.daily_revenue.map((item) => <div key={item.date} className="flex justify-between border-b border-gray-100 pb-2"><span>{new Date(item.date).toLocaleDateString('vi-VN')}</span><strong>{formatPrice(item.revenue)}</strong></div>) : <p className="text-gray-500">Chưa có doanh thu hoàn thành.</p>}</div>
                </div>
                <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black text-[#14315f]">Doanh thu theo tháng</h2>
                  <div className="mt-4 grid gap-3">{stats.monthly_revenue?.length ? stats.monthly_revenue.map((item) => <div key={item.month} className="flex justify-between border-b border-gray-100 pb-2"><span>{item.month}</span><strong>{formatPrice(item.revenue)}</strong></div>) : <p className="text-gray-500">Chưa có doanh thu hoàn thành.</p>}</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm sản phẩm" className="min-h-[46px] min-w-[240px] flex-1 rounded border border-gray-200 bg-white px-4 outline-none focus:border-[#14315f]" />
                <button type="button" onClick={openCreate} className="rounded bg-[#14315f] px-5 py-3 font-black text-white">Thêm sản phẩm</button>
              </div>
              <div className="overflow-hidden rounded border border-gray-200 bg-white">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="grid gap-3 border-b border-gray-100 p-3 last:border-0 md:grid-cols-[64px_1fr_150px_160px] md:items-center">
                    <img src={imageUrl(product.image)} alt={product.name} className="h-14 w-12 rounded bg-gray-100 object-cover" />
                    <div>
                      <p className="font-black text-[#14315f]">{product.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{product.product_code}</p>
                    </div>
                    <p className="font-black text-red-600">{formatPrice(product.price)}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(product.id)} className="rounded border border-gray-200 px-4 py-2 font-bold">Sửa</button>
                      <button type="button" onClick={() => deleteProduct(product)} className="rounded border border-red-200 px-4 py-2 font-bold text-red-600">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'orders' && <OrderManagement orders={orders} onUpdateStatus={updateOrderStatus} updatingOrderId={updatingOrderId} />}
          {activeSection === 'inventory' && <InventoryManagement inventory={inventory} onUpdate={updateInventory} />}
          {activeSection === 'categories' && <CategoryManagement categories={categories} onSave={saveCategory} onDelete={deleteCategory} />}
          {activeSection === 'customers' && <CustomerManagement customers={customers} />}
          {activeSection === 'discounts' && <DiscountManagement discounts={discounts} onSave={saveDiscount} onDelete={deleteDiscount} />}
        </div>
      </main>

      {form && (
        <ProductForm
          brands={brands}
          categories={categories}
          form={form}
          mode={formMode}
          onChange={updateForm}
          onToggleCategory={toggleCategory}
          onUpload={uploadProductImage}
          onClose={() => setForm(null)}
          onSubmit={saveProduct}
          saving={saving}
          uploading={uploading}
        />
      )}
    </div>
  )
}
