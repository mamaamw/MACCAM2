import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/api'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.register(formData)
      setAuth(response.data.user, response.data.token)
      toast.success('Inscription réussie !')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-0 shadow-lg">
      <div className="card-body p-5">
        <h4 className="fw-bold mb-4">Inscription</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Prénom</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Adresse Email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="feather-mail"></i></span>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Téléphone</label>
              <div className="input-group">
                <span className="input-group-text"><i className="feather-phone"></i></span>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text"><i className="feather-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>

            <div className="col-12">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100"
              >
                {loading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="mb-0">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary fw-bold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
