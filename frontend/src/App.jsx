import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import AdminRoute from './components/AdminRoute'
import { AccountInfo, AccountOrders, AccountAddresses } from './pages/Account'
import { authService } from './services/api'
import { useAuthStore } from './services/store'

function HomeRoute() {
  const location = useLocation()
  const { user, token, setUser } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    setUser: state.setUser,
  }))
  const [loading, setLoading] = useState(Boolean(token && !user?.account_type))
  const previewStore = new URLSearchParams(location.search).get('view') === 'store'

  useEffect(() => {
    if (!token || user?.account_type) {
      setLoading(false)
      return
    }

    authService.getCurrentUser()
      .then((response) => setUser(response.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, user?.account_type, setUser])

  if (loading) return <p className="p-8 font-bold">Đang tải tài khoản...</p>
  if (!previewStore && user?.account_type === 'ADMIN') return <Navigate to="/admin" replace />
  return <Home />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/account" element={<AccountInfo />} />
        <Route path="/account/orders" element={<AccountOrders />} />
        <Route path="/account/addresses" element={<AccountAddresses />} />
      </Routes>
    </Router>
  )
}

export default App
