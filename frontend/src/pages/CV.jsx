import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import cvService from '../services/cvService'
import toast from '../utils/toast'

export default function CV() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('timeline')
  const [loading, setLoading] = useState(false)
  
  // Data states
  const [experiences, setExperiences] = useState([])
  const [education, setEducation] = useState([])
  const [trainings, setTrainings] = useState([])
  const [certificates, setCertificates] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  
  // Form states with generic handler
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [expRes, eduRes, trainRes, certRes, volRes, projRes, skillRes] = await Promise.all([
        cvService.getExperiences(),
        cvService.getEducation(),
        cvService.getTrainings(),
        cvService.getCertificates(),
        cvService.getVolunteers(),
        cvService.getProjects(),
        cvService.getSkills()
      ])
      
      setExperiences(expRes.data || [])
      setEducation(eduRes.data || [])
      setTrainings(trainRes.data || [])
      setCertificates(certRes.data || [])
      setVolunteers(volRes.data || [])
      setProjects(projRes.data || [])
      setSkills(skillRes.data || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de chargement: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
  }

  const formatDateInput = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  const parseJSON = (str) => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return []
    }
  }

  // Generic CRUD handlers
  const handleAdd = (type) => {
    setEditingItem(null)
    setFormData(getDefaultFormData(type))
    setActiveModal(type)
  }

  const handleEdit = (type, item) => {
setEditingItem(item)
    setFormData(formatItemForEdit(type, item))
    setActiveModal(type)
  }

  const handleSave = async (type) => {
    setLoading(true)
    try {
      if (editingItem) {
        await getService(type).update(editingItem.id, formData)
      } else {
        await getService(type).create(formData)
      }
      await loadAllData()
      setActiveModal(null)
      setFormData({})
    } catch (error) {
      toast.error('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm('Supprimer cet élément ?')) return
    try {
      await getService(type).delete(id)
      await loadAllData()
    } catch (error) {
      toast.error('Erreur: ' + error.message)
    }
  }

  // Helper functions
  const getService = (type) => {
    const services = {
      experience: {
        create: cvService.createExperience,
        update: cvService.updateExperience,
        delete: cvService.deleteExperience
      },
      education: {
        create: cvService.createEducation,
        update: cvService.updateEducation,
        delete: cvService.deleteEducation
      },
      training: {
        create: cvService.createTraining,
        update: cvService.updateTraining,
        delete: cvService.deleteTraining
      },
      certificate: {
        create: cvService.createCertificate,
        update: cvService.updateCertificate,
        delete: cvService.deleteCertificate
      },
      volunteer: {
        create: cvService.createVolunteer,
        update: cvService.updateVolunteer,
        delete: cvService.deleteVolunteer
      },
      project: {
        create: cvService.createProject,
        update: cvService.updateProject,
        delete: cvService.deleteProject
      },
      skill: {
        create: cvService.createSkill,
        update: cvService.updateSkill,
        delete: cvService.deleteSkill
      }
    }
    return services[type]
  }

  const getDefaultFormData = (type) => {
    const defaults = {
      experience: { title: '', company: '', location: '', employmentType: 'CDI', startDate: '', endDate: '', isCurrent: false, description: '' },
      education: { degree: '', fieldOfStudy: '', school: '', location: '', startDate: '', endDate: '', isCurrent: false, grade: '', description: '' },
      training: { name: '', organization: '', instructor: '', duration: '', completionDate: '', description: '', url: '' },
      certificate: { name: '', issuingOrg: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', description: '' },
      volunteer: { role: '', organization: '', cause: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' },
      project: { name: '', role: '', description: '', startDate: '', endDate: '', isCurrent: false, url: '' },
      skill: { name: '', category: 'Technique', level: 'Intermédiaire', yearsOfExp: '', description: '' }
    }
    return defaults[type] || {}
  }

  const formatItemForEdit = (type, item) => {
    const formatted = { ...item }
    if (formatted.startDate) formatted.startDate = formatDateInput(formatted.startDate)
    if (formatted.endDate) formatted.endDate = formatDateInput(formatted.endDate)
    if (formatted.issueDate) formatted.issueDate = formatDateInput(formatted.issueDate)
    if (formatted.expiryDate) formatted.expiryDate = formatDateInput(formatted.expiryDate)
    if (formatted.completionDate) formatted.completionDate = formatDateInput(formatted.completionDate)
    return formatted
  }

  // Timeline items
  const getTimelineItems = () => {
    const items = []
    experiences.forEach(exp => items.push({ type: 'experience', date: new Date(exp.startDate), data: exp }))
    education.forEach(edu => items.push({ type: 'education', date: new Date(edu.startDate), data: edu }))
    volunteers.forEach(vol => items.push({ type: 'volunteer', date: new Date(vol.startDate), data: vol }))
    return items.sort((a, b) => b.date - a.date)
  }

  return (
    <>
      <style>{`
        .timeline-wrapper {
          position: relative;
          padding-left: 30px;
        }
        .timeline-wrapper::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }
        .timeline-item {
          position: relative;
          padding-bottom: 30px;
        }
        .timeline-icon {
          position: absolute;
          left: -38px;
          top: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          z-index: 1;
        }
        .timeline-content {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .timeline-content:hover {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          transition: box-shadow 0.2s;
        }
        .bg-soft-primary { background-color: rgba(79, 70, 229, 0.1); }
        .bg-soft-info { background-color: rgba(59, 130, 246, 0.1); }
        .bg-soft-success { background-color: rgba(16, 185, 129, 0.1); }
      `}</style>
      
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Mon CV</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Accueil</a></li>
            <li className="breadcrumb-item">CV</li>
          </ul>
        </div>
        <div className="page-header-right ms-auto">
          <button className="btn btn-primary" onClick={() => toast.info('Export PDF disponible prochainement')}>
            <i className="feather-download me-2"></i>
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="row">
          {/* Profile Card */}
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-4">
                  <img 
                    src={user?.avatar ? `http://localhost:5000${user.avatar}` : '/assets/images/avatar/1.png'} 
                    alt={`${user?.firstName} ${user?.lastName}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <div className="flex-grow-1">
                    <h3>{user?.firstName} {user?.lastName}</h3>
                    <p className="text-muted mb-2">{user?.jobTitle || 'Professionnel'}</p>
                    <div className="d-flex gap-4 flex-wrap">
                      <span><i className="feather-mail me-2"></i>{user?.email}</span>
                      {user?.phone && <span><i className="feather-phone me-2"></i>{user.phone}</span>}
                      {user?.city && <span><i className="feather-map-pin me-2"></i>{user.city}</span>}
                    </div>
                  </div>
                  <div className="d-flex gap-4">
                    <div className="text-center">
                      <h4>{experiences.length}</h4>
                      <small className="text-muted">Expériences</small>
                    </div>
                    <div className="text-center">
                      <h4>{education.length}</h4>
                      <small className="text-muted">Formations</small>
                    </div>
                    <div className="text-center">
                      <h4>{projects.length}</h4>
                      <small className="text-muted">Projets</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')} type="button">
                      <i className="feather-clock me-2"></i>Timeline
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'formations' ? 'active' : ''}`} onClick={() => setActiveTab('formations')} type="button">
                      <i className="feather-book me-2"></i>Formations & Certificats
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')} type="button">
                      <i className="feather-briefcase me-2"></i>Projets
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')} type="button">
                      <i className="feather-zap me-2"></i>Compétences
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </div>
                )}

                {!loading && activeTab === 'timeline' && (
                  <div>
                    <div className="d-flex justify-content-between mb-4">
                      <h5>Parcours</h5>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-primary" onClick={() => handleAdd('experience')}>
                          <i className="feather-plus me-1"></i>Expérience
                        </button>
                        <button className="btn btn-sm btn-info" onClick={() => handleAdd('education')}>
                          <i className="feather-plus me-1"></i>Études
                        </button>
                        <button className="btn btn-sm btn-success" onClick={() => handleAdd('volunteer')}>
                          <i className="feather-plus me-1"></i>Bénévolat
                        </button>
                      </div>
                    </div>

                    {getTimelineItems().length === 0 ? (
                      <div className="text-center py-5">
                        <i className="feather-inbox fs-1 text-muted mb-3"></i>
                        <p className="text-muted">Aucune expérience ajoutée</p>
                      </div>
                    ) : (
                      <div className="timeline-wrapper">
                        {getTimelineItems().map((item, idx) => (
                          <div key={`${item.type}-${item.data.id}`} className="timeline-item">
                            <div className={`timeline-icon ${
                              item.type === 'experience' ? 'bg-soft-primary text-primary' :
                              item.type === 'education' ? 'bg-soft-info text-info' : 'bg-soft-success text-success'
                            }`}>
                              <i className={`feather-${item.type === 'experience' ? 'briefcase' : item.type === 'education' ? 'book' : 'heart'}`}></i>
                            </div>
                            <div className="timeline-content">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h6 className="fw-bold">
                                    {item.type === 'experience' ? item.data.title : 
                                     item.type === 'education' ? `${item.data.degree} en ${item.data.fieldOfStudy}` : 
                                     item.data.role}
                                  </h6>
                                  <p className="text-muted">
                                    {item.type === 'experience' ? item.data.company : 
                                     item.type === 'education' ? item.data.school : 
                                     item.data.organization}
                                  </p>
                                  <small className="text-muted">
                                    {formatDate(item.data.startDate)} - {item.data.isCurrent ? 'Présent' : formatDate(item.data.endDate)}
                                  </small>
                                  {item.data.description && <p className="mt-2">{item.data.description}</p>}
                                </div>
                                <div className="dropdown">
                                  <button type="button" className="btn btn-sm" data-bs-toggle="dropdown">
                                    <i className="feather-more-vertical"></i>
                                  </button>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <button className="dropdown-item" onClick={() => handleEdit(item.type, item.data)} type="button">
                                      <i className="feather-edit me-2"></i>Modifier
                                    </button>
                                    <button className="dropdown-item text-danger" onClick={() => handleDelete(item.type, item.data.id)} type="button">
                                      <i className="feather-trash-2 me-2"></i>Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!loading && activeTab === 'formations' && (
                  <div>
                    <div className="mb-5">
                      <div className="d-flex justify-content-between mb-3">
                        <h5>Formations</h5>
                        <button className="btn btn-sm btn-primary" onClick={() => handleAdd('training')}>
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      <div className="row g-3">
                        {trainings.map(train => (
                          <div key={train.id} className="col-md-6">
                            <div className="card border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between">
                                  <h6 className="fw-bold">{train.name}</h6>
                                  <div className="dropdown">
                                    <button type="button" className="btn btn-sm" data-bs-toggle="dropdown"><i className="feather-more-vertical"></i></button>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <button className="dropdown-item" onClick={() => handleEdit('training', train)} type="button">
                                        <i className="feather-edit me-2"></i>Modifier
                                      </button>
                                      <button className="dropdown-item text-danger" onClick={() => handleDelete('training', train.id)} type="button">
                                        <i className="feather-trash-2 me-2"></i>Supprimer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-muted mb-2">{train.organization}</p>
                                {train.completionDate && <small>Complété: {formatDate(train.completionDate)}</small>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between mb-3">
                        <h5>Certificats</h5>
                        <button className="btn btn-sm btn-primary" onClick={() => handleAdd('certificate')}>
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      <div className="row g-3">
                        {certificates.map(cert => (
                          <div key={cert.id} className="col-md-6">
                            <div className="card border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between">
                                  <h6 className="fw-bold">{cert.name}</h6>
                                  <div className="dropdown">
                                    <button type="button" className="btn btn-sm" data-bs-toggle="dropdown"><i className="feather-more-vertical"></i></button>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <button className="dropdown-item" onClick={() => handleEdit('certificate', cert)} type="button">
                                        <i className="feather-edit me-2"></i>Modifier
                                      </button>
                                      <button className="dropdown-item text-danger" onClick={() => handleDelete('certificate', cert.id)} type="button">
                                        <i className="feather-trash-2 me-2"></i>Supprimer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-muted">{cert.issuingOrg}</p>
                                <small>Obtenu: {formatDate(cert.issueDate)}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!loading && activeTab === 'projects' && (
                  <div>
                    <div className="d-flex justify-content-between mb-4">
                      <h5>Projets</h5>
                      <button className="btn btn-sm btn-primary" onClick={() => handleAdd('project')}>
                        <i className="feather-plus me-1"></i>Ajouter
                      </button>
                    </div>
                    <div className="row g-4">
                      {projects.map(proj => (
                        <div key={proj.id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <h5 className="fw-bold">{proj.name}</h5>
                                  {proj.role && <p className="text-muted mb-0">{proj.role}</p>}
                                </div>
                                <div className="dropdown">
                                  <button type="button" className="btn btn-sm" data-bs-toggle="dropdown"><i className="feather-more-vertical"></i></button>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <button className="dropdown-item" onClick={() => handleEdit('project', proj)} type="button">
                                      <i className="feather-edit me-2"></i>Modifier
                                    </button>
                                    <button className="dropdown-item text-danger" onClick={() => handleDelete('project', proj.id)} type="button">
                                      <i className="feather-trash-2 me-2"></i>Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <p className="fs-12 mb-3">{proj.description}</p>
                              <small className="text-muted">
                                {formatDate(proj.startDate)} - {proj.isCurrent ? 'En cours' : formatDate(proj.endDate)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && activeTab === 'skills' && (
                  <div>
                   <div className="d-flex justify-content-between mb-4">
                      <h5>Compétences</h5>
                      <button className="btn btn-sm btn-primary" onClick={() => handleAdd('skill')}>
                        <i className="feather-plus me-1"></i>Ajouter
                      </button>
                    </div>
                    {Array.from(new Set(skills.map(s => s.category))).map(category => (
                      <div key={category} className="mb-4">
                        <h6 className="fw-bold mb-3">{category}</h6>
                        <div className="row g-3">
                          {skills.filter(s => s.category === category).map(skill => (
                            <div key={skill.id} className="col-md-6">
                              <div className="card border">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <h6 className="fw-bold">{skill.name}</h6>
                                      <span className="badge bg-soft-primary text-primary">{skill.level}</span>
                                      {skill.yearsOfExp && <small className="text-muted ms-2">{skill.yearsOfExp} ans</small>}
                                    </div>
                                    <div className="dropdown">
                                      <button type="button" className="btn btn-sm" data-bs-toggle="dropdown"><i className="feather-more-vertical"></i></button>
                                      <div className="dropdown-menu dropdown-menu-end">
                                        <button className="dropdown-item" onClick={() => handleEdit('skill', skill)} type="button">
                                          <i className="feather-edit me-2"></i>Modifier
                                        </button>
                                        <button className="dropdown-item text-danger" onClick={() => handleDelete('skill', skill.id)} type="button">
                                          <i className="feather-trash-2 me-2"></i>Supprimer
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - Simplified Generic Modal */}
      {activeModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setActiveModal(null)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingItem ? 'Modifier' : 'Ajouter'} {activeModal}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body">
                {activeModal === 'experience' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Titre du poste *</label>
                      <input type="text" className="form-control" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Entreprise *</label>
                      <input type="text" className="form-control" value={formData.company || ''} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Localisation</label>
                      <input type="text" className="form-control" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label>Date de début *</label>
                      <input type="date" className="form-control" value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Date de fin</label>
                      <input type="date" className="form-control" value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} disabled={formData.isCurrent} />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" checked={formData.isCurrent || false} onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})} />
                        <label className="form-check-label">Poste actuel</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea className="form-control" rows="4" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                )}

                {activeModal === 'education' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Diplôme *</label>
                      <input type="text" className="form-control" value={formData.degree || ''} onChange={(e) => setFormData({...formData, degree: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Domaine *</label>
                      <input type="text" className="form-control" value={formData.fieldOfStudy || ''} onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>École *</label>
                      <input type="text" className="form-control" value={formData.school || ''} onChange={(e) => setFormData({...formData, school: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Localisation</label>
                      <input type="text" className="form-control" value={formData.location || ''} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label>Date début *</label>
                      <input type="date" className="form-control" value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Date fin</label>
                      <input type="date" className="form-control" value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} disabled={formData.isCurrent} />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" checked={formData.isCurrent || false} onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})} />
                        <label className="form-check-label">En cours</label>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'training' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Nom de la formation *</label>
                      <input type="text" className="form-control" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Organisation *</label>
                      <input type="text" className="form-control" value={formData.organization || ''} onChange={(e) => setFormData({...formData, organization: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Durée</label>
                      <input type="text" className="form-control" value={formData.duration || ''} onChange={(e) => setFormData({...formData, duration: e.target.value})} placeholder="Ex: 40 heures" />
                    </div>
                    <div className="col-md-6">
                      <label>Date de finalisation</label>
                      <input type="date" className="form-control" value={formData.completionDate || ''} onChange={(e) => setFormData({...formData, completionDate: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label>URL</label>
                      <input type="url" className="form-control" value={formData.url || ''} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea className="form-control" rows="3" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                )}

                {activeModal === 'certificate' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Nom du certificat *</label>
                      <input type="text" className="form-control" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Organisme émetteur *</label>
                      <input type="text" className="form-control" value={formData.issuingOrg || ''} onChange={(e) => setFormData({...formData, issuingOrg: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>ID de certification</label>
                      <input type="text" className="form-control" value={formData.credentialId || ''} onChange={(e) => setFormData({...formData, credentialId: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label>Date d'obtention *</label>
                      <input type="date" className="form-control" value={formData.issueDate || ''} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Date d'expiration</label>
                      <input type="date" className="form-control" value={formData.expiryDate || ''} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label>URL de vérification</label>
                      <input type="url" className="form-control" value={formData.credentialUrl || ''} onChange={(e) => setFormData({...formData, credentialUrl: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea className="form-control" rows="3" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                )}

                {activeModal === 'volunteer' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Rôle *</label>
                      <input type="text" className="form-control" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Organisation *</label>
                      <input type="text" className="form-control" value={formData.organization || ''} onChange={(e) => setFormData({...formData, organization: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Cause</label>
                      <input type="text" className="form-control" value={formData.cause || ''} onChange={(e) => setFormData({...formData, cause: e.target.value})} placeholder="Ex: Éducation, Environnement..." />
                    </div>
                    <div className="col-md-4">
                      <label>Date de début *</label>
                      <input type="date" className="form-control" value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label>Date de fin</label>
                      <input type="date" className="form-control" value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} disabled={formData.isCurrent} />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" checked={formData.isCurrent || false} onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})} />
                        <label className="form-check-label">En cours</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea className="form-control" rows="3" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                )}

                {activeModal === 'project' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Nom du projet *</label>
                      <input type="text" className="form-control" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label>Rôle</label>
                      <input type="text" className="form-control" value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="Ex: Développeur principal" />
                    </div>
                    <div className="col-md-6">
                      <label>URL du projet</label>
                      <input type="url" className="form-control" value={formData.url || ''} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="col-md-4">
                      <label>Date de début</label>
                      <input type="date" className="form-control" value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label>Date de fin</label>
                      <input type="date" className="form-control" value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} disabled={formData.isCurrent} />
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" checked={formData.isCurrent || false} onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})} />
                        <label className="form-check-label">En cours</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label>Description *</label>
                      <textarea className="form-control" rows="4" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
                    </div>
                  </div>
                )}

                {activeModal === 'skill' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label>Nom de la compétence *</label>
                      <input type="text" className="form-control" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label>Catégorie *</label>
                      <select className="form-select" value={formData.category || 'Technique'} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                        <option value="Technique">Technique</option>
                        <option value="Linguistique">Linguistique</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Creative">Créative</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label>Niveau *</label>
                      <select className="form-select" value={formData.level || 'Intermédiaire'} onChange={(e) => setFormData({...formData, level: e.target.value})} required>
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label>Années d'expérience</label>
                      <input type="number" className="form-control" value={formData.yearsOfExp || ''} onChange={(e) => setFormData({...formData, yearsOfExp: parseInt(e.target.value) || ''})} min="0" max="50" />
                    </div>
                    <div className="col-12">
                      <label>Description</label>
                      <textarea className="form-control" rows="3" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                  </div>
                )}
                
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setActiveModal(null)}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={() => handleSave(activeModal)} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
