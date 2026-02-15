export default function TimesheetsReport() {
  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          {/* Page Header */}
          <div className="col-lg-12">
            <div className="page-header-title">
              <h4 className="m-b-10">Rapport des Feuilles de Temps</h4>
              <p className="m-b-0 text-muted">
                Suivi du temps de travail et analyse de la productivité
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Période</label>
                    <select className="form-select">
                      <option>Cette semaine</option>
                      <option>Ce mois</option>
                      <option>Mois dernier</option>
                      <option>Personnalisé</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Employé</label>
                    <select className="form-select">
                      <option>Tous les employés</option>
                      <option>Alexandra Della</option>
                      <option>Green Cute</option>
                      <option>Malanie Hanvey</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Projet</label>
                    <select className="form-select">
                      <option>Tous les projets</option>
                      <option>Site E-commerce</option>
                      <option>Application Mobile</option>
                      <option>Refonte UI/UX</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <button className="btn btn-primary w-100">
                      <i className="feather-filter me-2"></i>
                      Filtrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row">
          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">2,456</div>
                  <div className="avatar-text avatar-lg bg-soft-primary text-primary">
                    <i className="feather-clock"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Heures Totales</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+8.5%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">1,985</div>
                  <div className="avatar-text avatar-lg bg-soft-success text-success">
                    <i className="feather-check-circle"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Heures Facturables</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">80.8%</span>
                  <span className="fs-11 text-muted">du total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">471</div>
                  <div className="avatar-text avatar-lg bg-soft-warning text-warning">
                    <i className="feather-minus-circle"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Heures Non Facturables</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-warning">19.2%</span>
                  <span className="fs-11 text-muted">du total</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">124,250 €</div>
                  <div className="avatar-text avatar-lg bg-soft-danger text-danger">
                    <i className="feather-dollar-sign"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Valeur Facturée</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+12.3%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Performance de l'Équipe</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Employé</th>
                        <th>Heures Totales</th>
                        <th>Heures Facturables</th>
                        <th>Projets</th>
                        <th>Taux</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-image avatar-md">
                              <img src="/assets/images/avatar/1.png" alt="" className="img-fluid" />
                            </div>
                            <div>
                              <span className="d-block fw-bold">Alexandra Della</span>
                              <span className="fs-12 text-muted">Sales Manager</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="fw-bold text-dark">168h</span></td>
                        <td>
                          <span className="fw-bold text-success">156h</span>
                          <span className="fs-11 text-muted d-block">92.9%</span>
                        </td>
                        <td>12</td>
                        <td><span className="badge bg-soft-success text-success">Excellent</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-image avatar-md">
                              <img src="/assets/images/avatar/2.png" alt="" className="img-fluid" />
                            </div>
                            <div>
                              <span className="d-block fw-bold">Green Cute</span>
                              <span className="fs-12 text-muted">Project Manager</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="fw-bold text-dark">152h</span></td>
                        <td>
                          <span className="fw-bold text-success">135h</span>
                          <span className="fs-11 text-muted d-block">88.8%</span>
                        </td>
                        <td>8</td>
                        <td><span className="badge bg-soft-primary text-primary">Très Bon</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-image avatar-md">
                              <img src="/assets/images/avatar/3.png" alt="" className="img-fluid" />
                            </div>
                            <div>
                              <span className="d-block fw-bold">Malanie Hanvey</span>
                              <span className="fs-12 text-muted">Support Lead</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="fw-bold text-dark">145h</span></td>
                        <td>
                          <span className="fw-bold text-warning">112h</span>
                          <span className="fs-11 text-muted d-block">77.2%</span>
                        </td>
                        <td>6</td>
                        <td><span className="badge bg-soft-warning text-warning">Bon</span></td>
                        <td>
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-image avatar-md">
                              <img src="/assets/images/avatar/4.png" alt="" className="img-fluid" />
                            </div>
                            <div>
                              <span className="d-block fw-bold">Kenneth Hune</span>
                              <span className="fs-12 text-muted">Developer</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="fw-bold text-dark">162h</span></td>
                        <td>
                          <span className="fw-bold text-success">148h</span>
                          <span className="fs-11 text-muted d-block">91.4%</span>
                        </td>
                        <td>10</td>
                        <td><span className="badge bg-soft-success text-success">Excellent</span></td>
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
                <h5 className="card-title">Heures par Catégorie</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Développement</span>
                      <span className="fs-13 fw-bold text-dark">1,156h</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-primary" style={{ width: '47%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Design</span>
                      <span className="fs-13 fw-bold text-dark">624h</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-success" style={{ width: '25%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Gestion de Projet</span>
                      <span className="fs-13 fw-bold text-dark">392h</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-warning" style={{ width: '16%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Support</span>
                      <span className="fs-13 fw-bold text-dark">196h</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-info" style={{ width: '8%' }}></div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Autres</span>
                      <span className="fs-13 fw-bold text-dark">88h</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-danger" style={{ width: '4%' }}></div>
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
