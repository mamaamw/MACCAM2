import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function PublicRoute({ children }) {
  const { token } = useAuthStore()

  if (token) {
    return <Navigate to="/" replace />
  }

  return children
}
