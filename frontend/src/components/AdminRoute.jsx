import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useAuthStore } from '../services/store'

export default function AdminRoute({ children }) {
  const { token, setUser } = useAuthStore((state) => ({
    token: state.token,
    setUser: state.setUser,
  }))
  const [loading, setLoading] = useState(Boolean(token))
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    authService.getCurrentUser()
      .then((response) => {
        setUser(response.data)
        setIsAdmin(response.data.account_type === 'ADMIN')
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, [token, setUser])

  if (!token) return <Navigate to="/login?redirect=/admin" replace />
  if (loading) return <p className="p-8 font-bold">Đang kiểm tra quyền truy cập...</p>
  if (!isAdmin) return <p className="p-8 font-bold text-red-600">Tài khoản không có quyền quản trị.</p>
  return children
}
