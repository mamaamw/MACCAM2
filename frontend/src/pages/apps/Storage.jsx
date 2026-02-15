export default function Storage() {
  const files = [
    { name: 'Projet_Q1_2026.pdf', size: '2.4 MB', type: 'pdf', date: '15 Fév 2026', icon: 'file-text' },
    { name: 'Presentation_Client.pptx', size: '5.8 MB', type: 'ppt', date: '14 Fév 2026', icon: 'file' },
    { name: 'Budget_2026.pdf', size: '1.2 MB', type: 'xlsx', date: '13 Fév 2026', icon: 'file-text' },
    { name: 'Contrat_TechCorp.pdf', size: '856 KB', type: 'pdf', date: '12 Fév 2026', icon: 'file-text' },
    { name: 'Logo_New.png', size: '245 KB', type: 'img', date: '11 Fév 2026', icon: 'image' },
    { name: 'Wireframes.fig', size: '3.2 MB', type: 'fig', date: '10 Fév 2026', icon: 'layout' },
  ]

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Stockage</h4>
                <p className="mb-0 text-muted">Gérez vos fichiers et documents</p>
              </div>
              <button className="btn btn-primary">
                <i className="feather-upload me-2"></i>
                Téléverser
              </button>
            </div>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="row">
          <div className="col-lg-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div className="avatar-text avatar-lg bg-soft-primary text-primary">
                    <i className="feather-hard-drive"></i>
                  </div>
                </div>
                <div className="fs-18 fw-bold text-dark mb-2">24.8 GB</div>
                <div className="fs-12 text-muted mb-3">sur 100 GB utilisés</div>
                <div className="progress ht-5">
                  <div className="progress-bar bg-primary" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div className="avatar-text avatar-lg bg-soft-success text-success">
                    <i className="feather-file-text"></i>
                  </div>
                </div>
                <div className="fs-18 fw-bold text-dark mb-2">1,248</div>
                <div className="fs-12 text-muted mb-3">Documents</div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div className="avatar-text avatar-lg bg-soft-warning text-warning">
                    <i className="feather-image"></i>
                  </div>
                </div>
                <div className="fs-18 fw-bold text-dark mb-2">8,456</div>
                <div className="fs-12 text-muted mb-3">Images</div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div className="avatar-text avatar-lg bg-soft-danger text-danger">
                    <i className="feather-folder"></i>
                  </div>
                </div>
                <div className="fs-18 fw-bold text-dark mb-2">156</div>
                <div className="fs-12 text-muted mb-3">Dossiers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Folders */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Accès Rapide</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {['Projets', 'Clients', 'Factures', 'Contrats', 'Marketing', 'RH'].map((folder, idx) => (
                    <div key={idx} className="col-lg-2 col-md-4">
                      <a href="#" onClick={(e) => e.preventDefault()} className="card border border-gray-5 hover-shadow">
                        <div className="card-body text-center p-4">
                          <i className="feather-folder text-warning" style={{ fontSize: '2.5rem' }}></i>
                          <h6 className="mt-3 mb-0">{folder}</h6>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Fichiers Récents</h5>
                <div className="card-header-action">
                  <div className="hstack gap-2">
                    <input type="text" className="form-control form-control-sm" placeholder="Rechercher..." />
                    <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                      <option>Tous les types</option>
                      <option>Documents</option>
                      <option>Images</option>
                      <option>Vidéos</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Taille</th>
                        <th>Type</th>
                        <th>Date de modification</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="avatar-text avatar-sm bg-soft-primary text-primary">
                                <i className={`feather-${file.icon}`}></i>
                              </div>
                              <span className="fw-semibold">{file.name}</span>
                            </div>
                          </td>
                          <td><span className="text-muted">{file.size}</span></td>
                          <td><span className="badge bg-soft-info text-info">{file.type.toUpperCase()}</span></td>
                          <td><span className="text-muted">{file.date}</span></td>
                          <td className="text-end">
                            <div className="hstack gap-2 justify-content-end">
                              <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm" title="Télécharger">
                                <i className="feather-download"></i>
                              </a>
                              <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm" title="Partager">
                                <i className="feather-share-2"></i>
                              </a>
                              <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm" title="Supprimer">
                                <i className="feather-trash-2"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
