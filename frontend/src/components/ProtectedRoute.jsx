import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    console.log('🔒 ProtectedRoute Check:', {
      path: location.pathname,
      hasToken: !!token,
      token: token ? `${token.substring(0, 20)}...` : null
    })
  }, [token, location])

  if (!token) {
    console.log('❌ Accès refusé - Redirection vers /login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ Accès autorisé')
  return children
}
