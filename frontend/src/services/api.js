import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (data) =>
    api.post('/auth/register', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
}

export const productService = {
  getProducts: (params) =>
    api.get('/products', { params }),
  
  getProduct: (id) =>
    api.get(`/products/${id}`),
  
  getCategories: () =>
    api.get('/products/search/categories'),
  
  getBrands: () =>
    api.get('/products/search/brands'),

  getFilters: () =>
    api.get('/products/search/filters'),
}

export const orderService = {
  createOrder: (data) =>
    api.post('/orders', data),
  
  getOrder: (id) =>
    api.get(`/orders/${id}`),
  
  getOrders: () =>
    api.get('/orders'),

  quoteOrder: (data) =>
    api.post('/orders/quote', data),
}

export const customerService = {
  getAddresses: () =>
    api.get('/customer/addresses'),

  createAddress: (data) =>
    api.post('/customer/addresses', data),

  deleteAddress: (id) =>
    api.delete(`/customer/addresses/${id}`),
}

export const adminService = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getOrders: () =>
    api.get('/admin/orders'),

  updateOrderStatus: (id, action) =>
    api.patch(`/admin/orders/${id}/status`, { action }),

  getCustomers: () =>
    api.get('/admin/customers'),

  getCategories: () =>
    api.get('/admin/categories'),

  createCategory: (data) =>
    api.post('/admin/categories', data),

  updateCategory: (id, data) =>
    api.put(`/admin/categories/${id}`, data),

  deleteCategory: (id) =>
    api.delete(`/admin/categories/${id}`),

  getInventory: () =>
    api.get('/admin/inventory'),

  updateInventory: (id, qty_on_hand) =>
    api.patch(`/admin/inventory/${id}`, { qty_on_hand }),

  getDiscountCodes: () =>
    api.get('/admin/discount-codes'),

  createDiscountCode: (data) =>
    api.post('/admin/discount-codes', data),

  updateDiscountCode: (id, data) =>
    api.put(`/admin/discount-codes/${id}`, data),

  deleteDiscountCode: (id) =>
    api.delete(`/admin/discount-codes/${id}`),

  createProduct: (data) =>
    api.post('/admin/products', data),

  updateProduct: (id, data) =>
    api.put(`/admin/products/${id}`, data),

  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`),

  uploadProductImage: (file) => {
    const form = new FormData()
    form.append('image', file)
    return api.post('/admin/uploads/product-image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

export default api
