import { create } from 'zustand'

const savedUser = localStorage.getItem('current_user')

export const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
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
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  
  addItem: (item) => {
    const items = [...get().items]
    const existingItem = items.find(i => i.sku_id === item.sku_id)
    
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + item.quantity, item.available_qty || Number.MAX_SAFE_INTEGER)
    } else {
      items.push({ ...item, quantity: Math.min(item.quantity, item.available_qty || item.quantity) })
    }
    
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },
  
  removeItem: (sku_id) => {
    const items = get().items.filter(i => i.sku_id !== sku_id)
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },
  
  updateQuantity: (sku_id, quantity) => {
    const items = [...get().items]
    const item = items.find(i => i.sku_id === sku_id)
    if (item) {
      item.quantity = Math.min(Math.max(1, quantity), item.available_qty || Number.MAX_SAFE_INTEGER)
    }
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
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
