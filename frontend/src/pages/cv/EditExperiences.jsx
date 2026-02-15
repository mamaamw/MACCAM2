import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function EditExperiences() {
  const navigate = useNavigate()
  const [experiences, setExperiences] = useState([])

  useEffect(() => {
    // Charger depuis localStorage ou backend
    const saved = localStorage.getItem('cv_experiences')
    if (saved) {
      setExperiences(JSON.parse(saved))
    } else {
      // Données par défaut
      setExperiences([
        {
          id: 1,
          title: 'Développeur Full Stack Senior',
          company: 'Tech Company',
          location: 'Paris, France',
          type: 'CDI',
          startDate: '2021-01',
          endDate: null,
          current: true,
          description: `• Développement d'applications web avec React et Node.js
• Architecture et conception de microservices
• Mentorat des développeurs juniors
• Optimisation des performances et de l'expérience utilisateur`
        }
      ])
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('cv_experiences', JSON.stringify(experiences))
    toast.success('Expériences enregistrées')
    navigate('/cv')
  }

  const handleAdd = () => {
    setExperiences([
      {
        id: Date.now(),
        title: '',
        company: '',
        location: '',
        type: 'CDI',
        startDate: '',
        endDate: null,
        current: false,
        description: ''
      },
      ...experiences
    ])
  }

  const handleUpdate = (id, field, value) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette expérience ?')) {
      setExperiences(experiences.filter(exp => exp.id !== id))
    }
  }

  return (
    <div className="main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Modifier les expériences</h4>
          <p className="text-muted mb-0">Gérez votre parcours professionnel</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light" onClick={() => navigate('/cv')}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="feather-check me-2"></i>
            Enregistrer
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <button className="btn btn-primary w-100" onClick={handleAdd}>
            <i className="feather-plus me-2"></i>
            Ajouter une expérience
          </button>
        </div>
      </div>

      {experiences.map((exp) => (
        <div key={exp.id} className="card mb-3">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Expérience professionnelle</h6>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(exp.id)}
              >
                <i className="feather-trash-2"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Titre du poste *</label>
                <input
                  type="text"
                  className="form-control"
                  value={exp.title}
                  onChange={(e) => handleUpdate(exp.id, 'title', e.target.value)}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Entreprise *</label>
                <input
                  type="text"
                  className="form-control"
                  value={exp.company}
                  onChange={(e) => handleUpdate(exp.id, 'company', e.target.value)}
                  placeholder="Ex: Google"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Localisation</label>
                <input
                  type="text"
                  className="form-control"
                  value={exp.location}
                  onChange={(e) => handleUpdate(exp.id, 'location', e.target.value)}
                  placeholder="Ex: Paris, France"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Type de contrat</label>
                <select
                  className="form-select"
                  value={exp.type}
                  onChange={(e) => handleUpdate(exp.id, 'type', e.target.value)}
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Stage">Stage</option>
                  <option value="Alternance">Alternance</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date de début</label>
                <input
                  type="month"
                  className="form-control"
                  value={exp.startDate}
                  onChange={(e) => handleUpdate(exp.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date de fin</label>
                <input
                  type="month"
                  className="form-control"
                  value={exp.endDate || ''}
                  onChange={(e) => handleUpdate(exp.id, 'endDate', e.target.value)}
                  disabled={exp.current}
                />
                <div className="form-check mt-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={exp.current}
                    onChange={(e) => {
                      handleUpdate(exp.id, 'current', e.target.checked)
                      if (e.target.checked) handleUpdate(exp.id, 'endDate', null)
                    }}
                  />
                  <label className="form-check-label">J'occupe actuellement ce poste</label>
                </div>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={exp.description}
                  onChange={(e) => handleUpdate(exp.id, 'description', e.target.value)}
                  placeholder="• Responsabilité 1&#10;• Responsabilité 2&#10;• Réalisation 3"
                />
                <small className="text-muted">Décrivez vos missions, responsabilités et réalisations</small>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-light" onClick={() => navigate('/cv')}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <i className="feather-check me-2"></i>
          Enregistrer
        </button>
      </div>
    </div>
  )
}
