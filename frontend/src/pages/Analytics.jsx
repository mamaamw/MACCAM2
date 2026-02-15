export default function Analytics() {
  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          {/* Page Header */}
          <div className="col-lg-12">
            <div className="page-header-title">
              <h4 className="m-b-10">Analytics Dashboard</h4>
              <p className="m-b-0 text-muted">
                Vue d'ensemble des performances et statistiques de votre entreprise
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row">
          <div className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div>
                    <div className="fs-20 fw-bold text-dark">45,860</div>
                    <div className="fs-12 text-muted text-truncate-1-line">Total des Ventes</div>
                  </div>
                  <div className="avatar-text avatar-xl bg-soft-primary text-primary">
                    <i className="feather-dollar-sign"></i>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Ce mois</div>
                    <div className="fs-13 fw-semibold text-dark">12,450</div>
                  </div>
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Croissance</div>
                    <div className="hstack gap-1">
                      <div className="fs-13 fw-semibold text-success">+12.5%</div>
                      <i className="feather-arrow-up fs-12 text-success"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div>
                    <div className="fs-20 fw-bold text-dark">2,456</div>
                    <div className="fs-12 text-muted text-truncate-1-line">Nouveaux Clients</div>
                  </div>
                  <div className="avatar-text avatar-xl bg-soft-success text-success">
                    <i className="feather-users"></i>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Ce mois</div>
                    <div className="fs-13 fw-semibold text-dark">456</div>
                  </div>
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Croissance</div>
                    <div className="hstack gap-1">
                      <div className="fs-13 fw-semibold text-success">+8.2%</div>
                      <i className="feather-arrow-up fs-12 text-success"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div>
                    <div className="fs-20 fw-bold text-dark">1,248</div>
                    <div className="fs-12 text-muted text-truncate-1-line">Projets Actifs</div>
                  </div>
                  <div className="avatar-text avatar-xl bg-soft-warning text-warning">
                    <i className="feather-briefcase"></i>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Terminés</div>
                    <div className="fs-13 fw-semibold text-dark">845</div>
                  </div>
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">En cours</div>
                    <div className="fs-13 fw-semibold text-dark">403</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="hstack justify-content-between mb-4">
                  <div>
                    <div className="fs-20 fw-bold text-dark">94.5%</div>
                    <div className="fs-12 text-muted text-truncate-1-line">Taux de Satisfaction</div>
                  </div>
                  <div className="avatar-text avatar-xl bg-soft-danger text-danger">
                    <i className="feather-smile"></i>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Excellent</div>
                    <div className="fs-13 fw-semibold text-dark">85%</div>
                  </div>
                  <div className="col-6">
                    <div className="fs-11 text-muted text-uppercase">Bon</div>
                    <div className="fs-13 fw-semibold text-dark">9.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row">
          <div className="col-xxl-8">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Évolution des Revenus</h5>
                <div className="card-header-action">
                  <div className="dropdown">
                    <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className="btn btn-sm btn-light-brand">
                      Cette année <i className="feather-chevron-down ms-2"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>Cette semaine</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>Ce mois</a></li>
                      <li><a className="dropdown-item" href="#" onClick={(e) => e.preventDefault()}>Cette année</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="feather-bar-chart-2 text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <p className="text-muted mt-3">Graphique de revenus ici</p>
                  <p className="text-muted small">Intégration ApexCharts à venir</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-4">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Répartition par Catégorie</h5>
              </div>
              <div className="card-body">
                <div className="text-center py-4">
                  <i className="feather-pie-chart text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <p className="text-muted mt-3">Graphique circulaire ici</p>
                  <p className="text-muted small">Intégration ApexCharts à venir</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-lg-6">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Activité Récente</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4 pb-4 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="avatar-text avatar-sm bg-soft-primary text-primary me-3">
                        <i className="feather-user-plus"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Nouveau client ajouté</h6>
                        <p className="fs-12 text-muted mb-0">TechCorp Solutions a été ajouté au système</p>
                        <span className="fs-11 text-muted">Il y a 2 heures</span>
                      </div>
                    </div>
                  </li>
                  <li className="mb-4 pb-4 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="avatar-text avatar-sm bg-soft-success text-success me-3">
                        <i className="feather-check-circle"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Projet terminé</h6>
                        <p className="fs-12 text-muted mb-0">Le projet "Site Web E-commerce" a été livré</p>
                        <span className="fs-11 text-muted">Il y a 5 heures</span>
                      </div>
                    </div>
                  </li>
                  <li className="mb-4 pb-4 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="avatar-text avatar-sm bg-soft-warning text-warning me-3">
                        <i className="feather-alert-circle"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Nouveau lead qualifié</h6>
                        <p className="fs-12 text-muted mb-0">InnoTech Industries montre un intérêt</p>
                        <span className="fs-11 text-muted">Il y a 1 jour</span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-start">
                      <div className="avatar-text avatar-sm bg-soft-danger text-danger me-3">
                        <i className="feather-dollar-sign"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Paiement reçu</h6>
                        <p className="fs-12 text-muted mb-0">12,500 € de GlobalTech Inc.</p>
                        <span className="fs-11 text-muted">Il y a 2 jours</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Performance de l'Équipe</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="avatar-image avatar-sm me-3">
                          <img src="/assets/images/avatar/1.png" alt="" className="img-fluid" />
                        </div>
                        <div>
                          <h6 className="mb-0">Alexandra Della</h6>
                          <p className="fs-12 text-muted mb-0">Responsable commercial</p>
                        </div>
                      </div>
                      <span className="badge bg-soft-success text-success">98%</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: '98%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="avatar-image avatar-sm me-3">
                          <img src="/assets/images/avatar/2.png" alt="" className="img-fluid" />
                        </div>
                        <div>
                          <h6 className="mb-0">Green Cute</h6>
                          <p className="fs-12 text-muted mb-0">Chef de projet</p>
                        </div>
                      </div>
                      <span className="badge bg-soft-primary text-primary">92%</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-primary" role="progressbar" style={{ width: '92%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="avatar-image avatar-sm me-3">
                          <img src="/assets/images/avatar/3.png" alt="" className="img-fluid" />
                        </div>
                        <div>
                          <h6 className="mb-0">Malanie Hanvey</h6>
                          <p className="fs-12 text-muted mb-0">Responsable support</p>
                        </div>
                      </div>
                      <span className="badge bg-soft-warning text-warning">87%</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-warning" role="progressbar" style={{ width: '87%' }}></div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        <div className="avatar-image avatar-sm me-3">
                          <img src="/assets/images/avatar/4.png" alt="" className="img-fluid" />
                        </div>
                        <div>
                          <h6 className="mb-0">Kenneth Hune</h6>
                          <p className="fs-12 text-muted mb-0">Developer</p>
                        </div>
                      </div>
                      <span className="badge bg-soft-info text-info">95%</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-info" role="progressbar" style={{ width: '95%' }}></div>
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
