import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function EditEducation() {
  const navigate = useNavigate()
  const [education, setEducation] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('cv_education')
    if (saved) {
      setEducation(JSON.parse(saved))
    } else {
      setEducation([
        {
          id: 1,
          degree: 'Master en Informatique',
          school: 'École d\'Ingénieurs',
          location: 'Paris, France',
          startDate: '2015-09',
          endDate: '2018-06',
          description: 'Spécialisation en développement logiciel et intelligence artificielle'
        }
      ])
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('cv_education', JSON.stringify(education))
    toast.success('Formation enregistrée')
    navigate('/cv')
  }

  const handleAdd = () => {
    setEducation([
      {
        id: Date.now(),
        degree: '',
        school: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      },
      ...education
    ])
  }

  const handleUpdate = (id, field, value) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette formation ?')) {
      setEducation(education.filter(edu => edu.id !== id))
    }
  }

  return (
    <div className="main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Modifier la formation</h4>
          <p className="text-muted mb-0">Gérez votre parcours académique</p>
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
            Ajouter une formation
          </button>
        </div>
      </div>

      {education.map((edu) => (
        <div key={edu.id} className="card mb-3">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Formation</h6>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(edu.id)}
              >
                <i className="feather-trash-2"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Diplôme *</label>
                <input
                  type="text"
                  className="form-control"
                  value={edu.degree}
                  onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                  placeholder="Ex: Master en Informatique"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">École/Université *</label>
                <input
                  type="text"
                  className="form-control"
                  value={edu.school}
                  onChange={(e) => handleUpdate(edu.id, 'school', e.target.value)}
                  placeholder="Ex: Université Paris-Saclay"
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Localisation</label>
                <input
                  type="text"
                  className="form-control"
                  value={edu.location}
                  onChange={(e) => handleUpdate(edu.id, 'location', e.target.value)}
                  placeholder="Ex: Paris, France"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date de début</label>
                <input
                  type="month"
                  className="form-control"
                  value={edu.startDate}
                  onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date de fin</label>
                <input
                  type="month"
                  className="form-control"
                  value={edu.endDate}
                  onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
                />
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={edu.description}
                  onChange={(e) => handleUpdate(edu.id, 'description', e.target.value)}
                  placeholder="Spécialisation, cours principaux, projets..."
                />
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
