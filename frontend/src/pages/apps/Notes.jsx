import { useState } from 'react'

export default function Notes() {
  const [notes] = useState([
    { id: 1, title: 'Réunion Client', content: 'Discuter des besoins pour le nouveau projet...', color: 'primary', date: '15 Fév 2026' },
    { id: 2, title: 'Idées Marketing', content: 'Stratégie de contenu pour les réseaux sociaux...', color: 'success', date: '14 Fév 2026' },
    { id: 3, title: 'Todo Liste', content: 'Finir la présentation, Envoyer les rapports...', color: 'warning', date: '13 Fév 2026' },
    { id: 4, title: 'Notes Technique', content: 'Architecture du nouveau module...', color: 'info', date: '12 Féev 2026' },
  ])

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Notes</h4>
                <p className="mb-0 text-muted">Gérez vos notes et idées</p>
              </div>
              <button className="btn btn-primary">
                <i className="feather-plus me-2"></i>
                Nouvelle Note
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          {notes.map((note) => (
            <div key={note.id} className="col-lg-3 col-md-6">
              <div className="card stretch stretch-full">
                <div className={`card-header bg-soft-${note.color}`}>
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className={`card-title text-${note.color} mb-0`}>{note.title}</h6>
                    <div className="dropdown">
                      <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className={`avatar-text avatar-sm text-${note.color}`}>
                        <i className="feather-more-vertical"></i>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li><a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>Modifier</a></li>
                        <li><a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>Partager</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item text-danger" href="#" onClick={(e) => e.preventDefault()}>Supprimer</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-text text-muted mb-3">{note.content}</p>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fs-11 text-muted">{note.date}</span>
                    <div className="hstack gap-2">
                      <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-xs">
                        <i className="feather-edit-3"></i>
                      </a>
                      <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-xs">
                        <i className="feather-star"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Note Card */}
          <div className="col-lg-3 col-md-6">
            <div className="card stretch stretch-full border-dashed-2 border-gray-5 bg-gray-100">
              <div className="card-body d-flex align-items-center justify-content-center" style={{minHeight: '250px'}}>
                <div className="text-center">
                  <i className="feather-plus-circle text-muted" style={{fontSize: '3rem', opacity: 0.5}}></i>
                  <h6 className="mt-3 text-muted">Ajouter une Note</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}
