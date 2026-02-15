export default function ProjectReport() {
  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          {/* Page Header */}
          <div className="col-lg-12">
            <div className="page-header-title">
              <h4 className="m-b-10">Rapport des Projets</h4>
              <p className="m-b-0 text-muted">
                Analyse et suivi de tous vos projets en cours et terminés
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row">
          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">1,248</div>
                  <div className="avatar-text avatar-lg bg-soft-primary text-primary">
                    <i className="feather-briefcase"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Total Projets</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+12.5%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">403</div>
                  <div className="avatar-text avatar-lg bg-soft-warning text-warning">
                    <i className="feather-clock"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">En Cours</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-warning">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">845</div>
                  <div className="avatar-text avatar-lg bg-soft-success text-success">
                    <i className="feather-check-circle"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Terminés</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+18.2%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">91.8%</div>
                  <div className="avatar-text avatar-lg bg-soft-danger text-danger">
                    <i className="feather-trending-up"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Taux de Réussite</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Projets Actifs</h5>
                <div className="card-header-action">
                  <select className="form-select form-select-sm">
                    <option>Tous les projets</option>
                    <option>En cours</option>
                    <option>En retard</option>
                    <option>Terminés</option>
                  </select>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Projet</th>
                        <th>Client</th>
                        <th>Progression</th>
                        <th>Budget</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="d-block fw-bold">Site E-commerce</span>
                          <span className="fs-12 text-muted">Échéance: 28 Fév 2026</span>
                        </td>
                        <td>TechCorp Solutions</td>
                        <td>
                          <div className="progress ht-5">
                            <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                          </div>
                          <span className="fs-11 text-muted">75%</span>
                        </td>
                        <td><span className="fw-bold">45,000 €</span></td>
                        <td><span className="badge bg-soft-success text-success">En cours</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="d-block fw-bold">Application Mobile</span>
                          <span className="fs-12 text-muted">Échéance: 15 Mar 2026</span>
                        </td>
                        <td>InnoTech Industries</td>
                        <td>
                          <div className="progress ht-5">
                            <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
                          </div>
                          <span className="fs-11 text-muted">45%</span>
                        </td>
                        <td><span className="fw-bold">62,000 €</span></td>
                        <td><span className="badge bg-soft-warning text-warning">En cours</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="d-block fw-bold">Refonte UI/UX</span>
                          <span className="fs-12 text-muted">Échéance: 05 Fév 2026</span>
                        </td>
                        <td>Digital Wave Co</td>
                        <td>
                          <div className="progress ht-5">
                            <div className="progress-bar bg-danger" style={{ width: '92%' }}></div>
                          </div>
                          <span className="fs-11 text-muted">92%</span>
                        </td>
                        <td><span className="fw-bold">18,500 €</span></td>
                        <td><span className="badge bg-soft-danger text-danger">En retard</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span className="d-block fw-bold">Système CRM</span>
                          <span className="fs-12 text-muted">Échéance: 20 Mar 2026</span>
                        </td>
                        <td>GreenTech Ltd</td>
                        <td>
                          <div className="progress ht-5">
                            <div className="progress-bar bg-info" style={{ width: '28%' }}></div>
                          </div>
                          <span className="fs-11 text-muted">28%</span>
                        </td>
                        <td><span className="fw-bold">75,000 €</span></td>
                        <td><span className="badge bg-soft-info text-info">En cours</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Répartition par Type</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Développement Web</span>
                      <span className="fs-13 fw-bold text-dark">487 (39%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-primary" style={{ width: '39%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Applications Mobiles</span>
                      <span className="fs-13 fw-bold text-dark">324 (26%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-success" style={{ width: '26%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Design UI/UX</span>
                      <span className="fs-13 fw-bold text-dark">212 (17%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-warning" style={{ width: '17%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Consultation</span>
                      <span className="fs-13 fw-bold text-dark">150 (12%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-info" style={{ width: '12%' }}></div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Autres</span>
                      <span className="fs-13 fw-bold text-dark">75 (6%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-danger" style={{ width: '6%' }}></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}
