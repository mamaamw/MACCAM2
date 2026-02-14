import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function PublicRoute({ children }) {
  const { token } = useAuthStore()

  useEffect(() => {
    console.log('🌐 PublicRoute Check:', {
      hasToken: !!token,
      willRedirect: !!token
    })
  }, [token])

  if (token) {
    console.log('✅ Déjà connecté - Redirection vers /')
    return <Navigate to="/" replace />
  }

  console.log('✅ Accès public autorisé')
  return children
}
