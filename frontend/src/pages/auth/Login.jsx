import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login(formData)
      setAuth(response.data.user, response.data.token)
      toast.success('Connexion réussie !')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-0 shadow-lg">
      <div className="card-body p-5">
        <h4 className="fw-bold mb-4">Connexion</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email ou Nom d'utilisateur</label>
            <div className="input-group">
              <span className="input-group-text"><i className="feather-user"></i></span>
              <input
                type="text"
                className="form-control"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@maccam.com ou admin"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Mot de passe</label>
            <div className="input-group">
              <span className="input-group-text"><i className="feather-lock"></i></span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "feather-eye-off" : "feather-eye"}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary fw-bold">
              S'inscrire
            </Link>
          </p>
        </div>

        <div className="alert alert-info mt-4">
          <p className="fw-bold mb-2 fs-12">Compte de test :</p>
          <p className="mb-1 fs-12">Email: admin@maccam.com ou Username: admin</p>
          <p className="mb-0 fs-12">Mot de passe: admin123</p>
        </div>
      </div>
    </div>
  )
}
