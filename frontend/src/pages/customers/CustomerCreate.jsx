import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { customerService } from '../../services/api'
import toast from 'react-hot-toast'

export default function CustomerCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await customerService.create(formData)
      toast.success('Client créé avec succès')
      navigate('/customers')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <Link to="/customers" className="btn btn-light btn-sm me-3">
                    <i className="feather-arrow-left me-2"></i>
                    Retour
                  </Link>
                  <div>
                    <h5 className="card-title mb-0">Nouveau Client</h5>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Nom de l'entreprise <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Nom du contact <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Site web</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Adresse</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Ville</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Code postal</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">Pays</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/customers')}
                          className="btn btn-light"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? 'Création...' : 'Créer le client'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}

