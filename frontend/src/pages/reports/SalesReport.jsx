export default function SalesReport() {
  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          {/* Page Header */}
          <div className="col-lg-12">
            <div className="page-header-title">
              <h4 className="m-b-10">Rapport des Ventes</h4>
              <p className="m-b-0 text-muted">
                Analyse détaillée de toutes vos ventes et revenus
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
                      <option>Ce mois</option>
                      <option>Mois dernier</option>
                      <option>Ce trimestre</option>
                      <option>Cette année</option>
                      <option>Personnalisé</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Catégorie</label>
                    <select className="form-select">
                      <option>Toutes les catégories</option>
                      <option>Services</option>
                      <option>Produits</option>
                      <option>Abonnements</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Client</label>
                    <select className="form-select">
                      <option>Tous les clients</option>
                      <option>Entreprise</option>
                      <option>Particulier</option>
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
                  <div className="fs-18 fw-bold text-dark">245,680 €</div>
                  <div className="avatar-text avatar-lg bg-soft-primary text-primary">
                    <i className="feather-trending-up"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Revenus Totaux</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-success">+15.2%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">1,248</div>
                  <div className="avatar-text avatar-lg bg-soft-success text-success">
                    <i className="feather-shopping-cart"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Nombre de Ventes</div>
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
                  <div className="fs-18 fw-bold text-dark">196 €</div>
                  <div className="avatar-text avatar-lg bg-soft-warning text-warning">
                    <i className="feather-bar-chart"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Panier Moyen</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-warning">+4.2%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="fs-18 fw-bold text-dark">89.2%</div>
                  <div className="avatar-text avatar-lg bg-soft-danger text-danger">
                    <i className="feather-percent"></i>
                  </div>
                </div>
                <div className="fs-12 text-muted text-uppercase mb-1">Taux de Conversion</div>
                <div className="hstack gap-2">
                  <span className="badge badge-soft-danger">-2.1%</span>
                  <span className="fs-11 text-muted">vs mois dernier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Détails des Ventes</h5>
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
                        <th>Réf.</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Produit/Service</th>
                        <th>Quantité</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="fw-bold">#SL-2024-001</span></td>
                        <td>15 Fév 2026</td>
                        <td>TechCorp Solutions</td>
                        <td>Développement Web</td>
                        <td>1</td>
                        <td><span className="fw-bold text-dark">12,500 €</span></td>
                        <td><span className="badge bg-soft-success text-success">Payé</span></td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold">#SL-2024-002</span></td>
                        <td>14 Fév 2026</td>
                        <td>InnoTech Industries</td>
                        <td>Licence Annuelle</td>
                        <td>5</td>
                        <td><span className="fw-bold text-dark">8,750 €</span></td>
                        <td><span className="badge bg-soft-success text-success">Payé</span></td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold">#SL-2024-003</span></td>
                        <td>12 Fév 2026</td>
                        <td>GreenTech Ltd</td>
                        <td>Consultation</td>
                        <td>10</td>
                        <td><span className="fw-bold text-dark">3,200 €</span></td>
                        <td><span className="badge bg-soft-warning text-warning">En attente</span></td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold">#SL-2024-004</span></td>
                        <td>10 Fév 2026</td>
                        <td>Digital Wave Co</td>
                        <td>Design UI/UX</td>
                        <td>1</td>
                        <td><span className="fw-bold text-dark">6,800 €</span></td>
                        <td><span className="badge bg-soft-success text-success">Payé</span></td>
                        <td className="text-end">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                            <i className="feather-eye"></i>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td><span className="fw-bold">#SL-2024-005</span></td>
                        <td>08 Fév 2026</td>
                        <td>SmartSoft Inc</td>
                        <td>Support premium</td>
                        <td>3</td>
                        <td><span className="fw-bold text-dark">2,400 €</span></td>
                        <td><span className="badge bg-soft-danger text-danger">Annulé</span></td>
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
              <div className="card-footer">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fs-12 text-muted">Affichage de 1 à 5 sur 1,248 résultats</div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className="page-item disabled"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>Précédent</a></li>
                      <li className="page-item active"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>1</a></li>
                      <li className="page-item"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>2</a></li>
                      <li className="page-item"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>3</a></li>
                      <li className="page-item"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>Suivant</a></li>
                    </ul>
                  </nav>
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
