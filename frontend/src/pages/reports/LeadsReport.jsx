export default function LeadsReport() {
  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          {/* Page Header */}
          <div className="col-lg-12">
            <div className="page-header-title">
              <h4 className="m-b-10">Rapport des prospects</h4>
              <p className="m-b-0 text-muted">
                Analyse et suivi de vos prospects et opportunités
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
                  <div className="fs-18 fw-bold text-dark">1,563</div>
                  <div className="avatar-text avatar-lg bg-soft-primary text-primary">
                    <i className="feather-users"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Total prospects</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+22.5%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">425</div>
                  <div className="avatar-text avatar-lg bg-soft-success text-success">
                    <i className="feather-check-circle"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Qualifiés</div>
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
                  <div className="fs-18 fw-bold text-dark">187</div>
                  <div className="avatar-text avatar-lg bg-soft-warning text-warning">
                    <i className="feather-user-check"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Convertis</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-warning">+12.8%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">27.2%</div>
                  <div className="avatar-text avatar-lg bg-soft-danger text-danger">
                    <i className="feather-percent"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Taux de Conversion</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+3.5%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row">
          <div className="col-lg-6">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Prospects par source</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Site Web</span>
                      <span className="fs-13 fw-bold text-dark">456 (29%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-primary" style={{ width: '29%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Référence</span>
                      <span className="fs-13 fw-bold text-dark">385 (25%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-success" style={{ width: '25%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Réseaux Sociaux</span>
                      <span className="fs-13 fw-bold text-dark">312 (20%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-warning" style={{ width: '20%' }}></div>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Email Marketing</span>
                      <span className="fs-13 fw-bold text-dark">234 (15%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-info" style={{ width: '15%' }}></div>
                    </div>
                  </li>
                  <li>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fs-13 text-dark">Autres</span>
                      <span className="fs-13 fw-bold text-dark">176 (11%)</span>
                    </div>
                    <div className="progress ht-3">
                      <div className="progress-bar bg-danger" style={{ width: '11%' }}></div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Prospects par statut</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="hstack gap-2">
                        <span className="wd-7 ht-7 bg-soft-primary border border-primary rounded-circle"></span>
                        <span className="fs-13 text-dark">Nouveau</span>
                      </div>
                      <span className="fs-13 fw-bold text-dark">623</span>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="hstack gap-2">
                        <span className="wd-7 ht-7 bg-soft-info border border-info rounded-circle"></span>
                        <span className="fs-13 text-dark">Contacté</span>
                      </div>
                      <span className="fs-13 fw-bold text-dark">438</span>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="hstack gap-2">
                        <span className="wd-7 ht-7 bg-soft-warning border border-warning rounded-circle"></span>
                        <span className="fs-13 text-dark">Qualifié</span>
                      </div>
                      <span className="fs-13 fw-bold text-dark">315</span>
                    </div>
                  </li>
                  <li className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="hstack gap-2">
                        <span className="wd-7 ht-7 bg-soft-success border border-success rounded-circle"></span>
                        <span className="fs-13 text-dark">Converti</span>
                      </div>
                      <span className="fs-13 fw-bold text-dark">187</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Prospects récents</h5>
                <div className="card-header-action">
                  <button className="btn btn-sm btn-light-brand">
                    <i className="feather-download me-2"></i>
                    Exporter
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Prospect</th>
                        <th>Entreprise</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Source</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-text avatar-md bg-soft-primary text-primary">JD</div>
                            <div>
                              <span className="d-block fw-bold">John Doe</span>
                            </div>
                          </div>
                        </td>
                        <td>TechCorp Inc.</td>
                        <td>john.doe@techcorp.com</td>
                        <td>+33 6 12 34 56 78</td>
                        <td><span className="badge bg-soft-primary text-primary">Site Web</span></td>
                        <td><span className="badge bg-soft-warning text-warning">Qualifié</span></td>
                        <td>15 Fév 2026</td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-text avatar-md bg-soft-success text-success">SM</div>
                            <div>
                              <span className="d-block fw-bold">Sarah Martin</span>
                            </div>
                          </div>
                        </td>
                        <td>InnoTech Ltd</td>
                        <td>s.martin@innotech.fr</td>
                        <td>+33 6 98 76 54 32</td>
                        <td><span className="badge bg-soft-success text-success">Référence</span></td>
                        <td><span className="badge bg-soft-success text-success">Converti</span></td>
                        <td>14 Fév 2026</td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-text avatar-md bg-soft-info text-info">MB</div>
                            <div>
                              <span className="d-block fw-bold">Michael Brown</span>
                            </div>
                          </div>
                        </td>
                        <td>Digital Wave</td>
                        <td>m.brown@digitalwave.com</td>
                        <td>+33 7 11 22 33 44</td>
                        <td><span className="badge bg-soft-info text-info">Email</span></td>
                        <td><span className="badge bg-soft-info text-info">Contacté</span></td>
                        <td>12 Fév 2026</td>
                        <td className="text-end">
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
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}
