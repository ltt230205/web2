import { create } from 'zustand'

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const saveCart = (set, items) => {
  localStorage.setItem('cart', JSON.stringify(items))
  set({ items })
}

const maxQuantity = (item) => item.available_qty ?? Number.MAX_SAFE_INTEGER
const savedUser = readJson('current_user', null)

export const useAuthStore = create((set) => ({
  user: savedUser,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  login: (token, refreshToken, user) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('current_user', JSON.stringify(user || null))
    set({ token, user, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('current_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
  
  setUser: (user) => {
    localStorage.setItem('current_user', JSON.stringify(user || null))
    set({ user })
  },
}))

export const useCartStore = create((set, get) => ({
  items: readJson('cart', []),
  
  addItem: (item) => {
    const items = [...get().items]
    const existingItem = items.find(i => i.sku_id === item.sku_id)
    
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + item.quantity, maxQuantity(item))
    } else {
      items.push({ ...item, quantity: Math.min(item.quantity, maxQuantity(item)) })
    }
    
    saveCart(set, items)
  },
  
  removeItem: (sku_id) => {
    const items = get().items.filter(i => i.sku_id !== sku_id)
    saveCart(set, items)
  },
  
  updateQuantity: (sku_id, quantity) => {
    const items = [...get().items]
    const item = items.find(i => i.sku_id === sku_id)
    if (item) {
      item.quantity = Math.min(Math.max(1, quantity), maxQuantity(item))
    }
    saveCart(set, items)
  },
  
  clearCart: () => {
    localStorage.removeItem('cart')
    set({ items: [] })
  },
  
  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
