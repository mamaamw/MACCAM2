import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div>Chargement du tableau de bord...</div>;
  }

  return (
    <div className="main-content">
      <div className="row">
        {/* [Invoices Awaiting Payment] start */}
        <div className="col-xxl-3 col-md-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className="avatar-text avatar-lg bg-gray-200">
                    <i className="feather-dollar-sign"></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark"><span className="counter">45</span>/<span className="counter">76</span></div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">Factures en attente de paiement</h3>
                  </div>
                </div>
                <a href="#" className="">
                  <i className="feather-more-vertical"></i>
                </a>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between">
                  <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Factures en attente </a>
                  <div className="w-100 text-end">
                    <span className="fs-12 text-dark">$5,569</span>
                    <span className="fs-11 text-muted">(56%)</span>
                  </div>
                </div>
                <div className="progress mt-2 ht-3">
                  <div className="progress-bar bg-primary" role="progressbar" style={{width: '56%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Invoices Awaiting Payment] end */}
        
        {/* [Converted Leads] start */}
        <div className="col-xxl-3 col-md-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className="avatar-text avatar-lg bg-gray-200">
                    <i className="feather-cast"></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark"><span className="counter">48</span>/<span className="counter">86</span></div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">Prospects convertis</h3>
                  </div>
                </div>
                <a href="#" className="">
                  <i className="feather-more-vertical"></i>
                </a>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between">
                  <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Prospects convertis </a>
                  <div className="w-100 text-end">
                    <span className="fs-12 text-dark">52 terminés</span>
                    <span className="fs-11 text-muted">(63%)</span>
                  </div>
                </div>
                <div className="progress mt-2 ht-3">
                  <div className="progress-bar bg-warning" role="progressbar" style={{width: '63%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Converted Leads] end */}
        
        {/* [Projects In Progress] start */}
        <div className="col-xxl-3 col-md-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className="avatar-text avatar-lg bg-gray-200">
                    <i className="feather-briefcase"></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark"><span className="counter">16</span>/<span className="counter">20</span></div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">Projets en cours</h3>
                  </div>
                </div>
                <a href="#" className="">
                  <i className="feather-more-vertical"></i>
                </a>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between">
                  <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Projets en cours </a>
                  <div className="w-100 text-end">
                    <span className="fs-12 text-dark">16 terminés</span>
                    <span className="fs-11 text-muted">(78%)</span>
                  </div>
                </div>
                <div className="progress mt-2 ht-3">
                  <div className="progress-bar bg-success" role="progressbar" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Projects In Progress] end */}
        
        {/* [Conversion Rate] start */}
        <div className="col-xxl-3 col-md-6">
          <div className="card stretch stretch-full">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between mb-4">
                <div className="d-flex gap-4 align-items-center">
                  <div className="avatar-text avatar-lg bg-gray-200">
                    <i className="feather-activity"></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-dark"><span className="counter">46.59</span>%</div>
                    <h3 className="fs-13 fw-semibold text-truncate-1-line">Taux de conversion</h3>
                  </div>
                </div>
                <a href="#" className="">
                  <i className="feather-more-vertical"></i>
                </a>
              </div>
              <div className="pt-4">
                <div className="d-flex align-items-center justify-content-between">
                  <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line"> Taux de conversion </a>
                  <div className="w-100 text-end">
                    <span className="fs-12 text-dark">$2,254</span>
                    <span className="fs-11 text-muted">(46%)</span>
                  </div>
                </div>
                <div className="progress mt-2 ht-3">
                  <div className="progress-bar bg-danger" role="progressbar" style={{width: '46%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Conversion Rate] end */}
        
        {/* [Payment Records] start */}
        <div className="col-xxl-8">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Historique de paiement</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body custom-card-action p-0">
              <div id="payment-records-chart"></div>
            </div>
            <div className="card-footer">
              <div className="row g-4">
                <div className="col-lg-3">
                  <div className="p-3 border border-dashed rounded">
                    <div className="fs-12 text-muted mb-1">En attente</div>
                    <h6 className="fw-bold text-dark">$5,486</h6>
                    <div className="progress mt-2 ht-3">
                      <div className="progress-bar bg-primary" role="progressbar" style={{width: '81%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="p-3 border border-dashed rounded">
                    <div className="fs-12 text-muted mb-1">Terminé</div>
                    <h6 className="fw-bold text-dark">$9,275</h6>
                    <div className="progress mt-2 ht-3">
                      <div className="progress-bar bg-success" role="progressbar" style={{width: '82%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="p-3 border border-dashed rounded">
                    <div className="fs-12 text-muted mb-1">Rejeté</div>
                    <h6 className="fw-bold text-dark">$3,868</h6>
                    <div className="progress mt-2 ht-3">
                      <div className="progress-bar bg-danger" role="progressbar" style={{width: '68%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="p-3 border border-dashed rounded">
                    <div className="fs-12 text-muted mb-1">Revenu</div>
                    <h6 className="fw-bold text-dark">$50,668</h6>
                    <div className="progress mt-2 ht-3">
                      <div className="progress-bar bg-dark" role="progressbar" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Payment Records] end */}
        
        {/* [Total Sales] start */}
        <div className="col-xxl-4">
          <div className="card stretch stretch-full overflow-hidden">
            <div className="bg-primary text-white">
              <div className="p-4">
                <span className="badge bg-light text-primary text-dark float-end">12%</span>
                <div className="text-start">
                  <h4 className="text-reset">30,569</h4>
                  <p className="text-reset m-0">Ventes totales</p>
                </div>
              </div>
              <div id="total-sales-color-graph"></div>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="hstack gap-3">
                  <div className="avatar-image avatar-lg p-2 rounded">
                    <img className="img-fluid" src="/assets/images/brand/shopify.png" alt="" />
                  </div>
                  <div>
                    <a href="#" className="d-block">Shopify eCommerce Store</a>
                    <span className="fs-12 text-muted">Développement</span>
                  </div>
                </div>
                <div>
                  <div className="fw-bold text-dark">$1200</div>
                  <div className="fs-12 text-end">6 Projets</div>
                </div>
              </div>
              <hr className="border-dashed my-3" />
              <div className="d-flex align-items-center justify-content-between">
                <div className="hstack gap-3">
                  <div className="avatar-image avatar-lg p-2 rounded">
                    <img className="img-fluid" src="/assets/images/brand/app-store.png" alt="" />
                  </div>
                  <div>
                    <a href="#" className="d-block">Développement d'apps iOS</a>
                    <span className="fs-12 text-muted">Développement</span>
                  </div>
                </div>
                <div>
                  <div className="fw-bold text-dark">$1450</div>
                  <div className="fs-12 text-end">3 Projets</div>
                </div>
              </div>
              <hr className="border-dashed my-3" />
              <div className="d-flex align-items-center justify-content-between">
                <div className="hstack gap-3">
                  <div className="avatar-image avatar-lg p-2 rounded">
                    <img className="img-fluid" src="/assets/images/brand/figma.png" alt="" />
                  </div>
                  <div>
                    <a href="#" className="d-block">Design de tableau de bord Figma</a>
                    <span className="fs-12 text-muted">Design UI/UX</span>
                  </div>
                </div>
                <div>
                  <div className="fw-bold text-dark">$1250</div>
                  <div className="fs-12 text-end">5 Projets</div>
                </div>
              </div>
            </div>
            <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center py-4">Détails complets</a>
          </div>
        </div>
        {/* [Total Sales] end */}
        
        {/* [Mini Cards] start */}
        <div className="col-lg-4">
          <div className="card mb-4 stretch stretch-full">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex gap-3 align-items-center">
                <div className="avatar-text">
                  <i className="feather feather-star"></i>
                </div>
                <div>
                  <div className="fw-semibold text-dark">Tâches terminées</div>
                  <div className="fs-12 text-muted">22/35 terminées</div>
                </div>
              </div>
              <div className="fs-4 fw-bold text-dark">22/35</div>
            </div>
            <div className="card-body d-flex align-items-center justify-content-between gap-4">
              <div id="task-completed-area-chart"></div>
              <div className="fs-12 text-muted text-nowrap">
                <span className="fw-semibold text-primary">28% de plus</span><br />
                <span>depuis la semaine dernière</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card mb-4 stretch stretch-full">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex gap-3 align-items-center">
                <div className="avatar-text">
                  <i className="feather feather-file-text"></i>
                </div>
                <div>
                  <div className="fw-semibold text-dark">Nouvelles tâches</div>
                  <div className="fs-12 text-muted">0/20 tâches</div>
                </div>
              </div>
              <div className="fs-4 fw-bold text-dark">5/20</div>
            </div>
            <div className="card-body d-flex align-items-center justify-content-between gap-4">
              <div id="new-tasks-area-chart"></div>
              <div className="fs-12 text-muted text-nowrap">
                <span className="fw-semibold text-success">34% de plus</span><br />
                <span>depuis la semaine dernière</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card mb-4 stretch stretch-full">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="d-flex gap-3 align-items-center">
                <div className="avatar-text">
                  <i className="feather feather-airplay"></i>
                </div>
                <div>
                  <div className="fw-semibold text-dark">Projet terminé</div>
                  <div className="fs-12 text-muted">20/30 projets</div>
                </div>
              </div>
              <div className="fs-4 fw-bold text-dark">20/30</div>
            </div>
            <div className="card-body d-flex align-items-center justify-content-between gap-4">
              <div id="project-done-area-chart"></div>
              <div className="fs-12 text-muted text-nowrap">
                <span className="fw-semibold text-danger">42% de plus</span><br />
                <span>depuis la semaine dernière</span>
              </div>
            </div>
          </div>
        </div>
        {/* [Mini Cards] end */}
        
        {/* [Leads Overview] start */}
        <div className="col-xxl-4">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Aperçu des prospects</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body custom-card-action">
              <div id="leads-overview-donut"></div>
              <div className="row g-2">
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#3454d1'}}></span>
                    <span>Nouveau<span className="fs-10 text-muted ms-1">(20K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#0d519e'}}></span>
                    <span>Contacté<span className="fs-10 text-muted ms-1">(15K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#1976d2'}}></span>
                    <span>Qualifié<span className="fs-10 text-muted ms-1">(10K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#1e88e5'}}></span>
                    <span>En traitement<span className="fs-10 text-muted ms-1">(18K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#2196f3'}}></span>
                    <span>Client<span className="fs-10 text-muted ms-1">(10K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#42a5f5'}}></span>
                    <span>Proposition<span className="fs-10 text-muted ms-1">(15K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#64b5f6'}}></span>
                    <span>Prospects<span className="fs-10 text-muted ms-1">(16K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#90caf9'}}></span>
                    <span>Progression<span className="fs-10 text-muted ms-1">(14K)</span></span>
                  </a>
                </div>
                <div className="col-4">
                  <a href="#" className="p-2 hstack gap-2 rounded border border-dashed border-gray-5">
                    <span className="wd-7 ht-7 rounded-circle d-inline-block" style={{backgroundColor: '#aad6fa'}}></span>
                    <span>Autres<span className="fs-10 text-muted ms-1">(10K)</span></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* [Leads Overview] end */}
        
        {/* [Latest Leads] start */}
        <div className="col-xxl-8">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Derniers prospects</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body custom-card-action p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr className="border-b">
                      <th scope="row">Utilisateurs</th>
                      <th>Proposition</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-image">
                            <img src="/assets/images/avatar/2.png" alt="" className="img-fluid" />
                          </div>
                          <a href="#">
                            <span className="d-block">Archie Cantones</span>
                            <span className="fs-12 d-block fw-normal text-muted">arcie.tones@gmail.com</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-gray-200 text-dark">Envoyé</span>
                      </td>
                      <td>11/06/2023 10:53</td>
                      <td>
                        <span className="badge bg-soft-success text-success">Terminé</span>
                      </td>
                      <td className="text-end">
                        <a href="#"><i className="feather-more-vertical"></i></a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-image">
                            <img src="/assets/images/avatar/3.png" alt="" className="img-fluid" />
                          </div>
                          <a href="#">
                            <span className="d-block">Holmes Cherryman</span>
                            <span className="fs-12 d-block fw-normal text-muted">golms.chan@gmail.com</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-gray-200 text-dark">Nouveau</span>
                      </td>
                      <td>11/06/2023 10:53</td>
                      <td>
                        <span className="badge bg-soft-primary text-primary">En cours </span>
                      </td>
                      <td className="text-end">
                        <a href="#"><i className="feather-more-vertical"></i></a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-image">
                            <img src="/assets/images/avatar/4.png" alt="" className="img-fluid" />
                          </div>
                          <a href="#">
                            <span className="d-block">Malanie Hanvey</span>
                            <span className="fs-12 d-block fw-normal text-muted">lanie.nveyn@gmail.com</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-gray-200 text-dark">Envoyé</span>
                      </td>
                      <td>11/06/2023 10:53</td>
                      <td>
                        <span className="badge bg-soft-success text-success">Terminé</span>
                      </td>
                      <td className="text-end">
                        <a href="#"><i className="feather-more-vertical"></i></a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-image">
                            <img src="/assets/images/avatar/5.png" alt="" className="img-fluid" />
                          </div>
                          <a href="#">
                            <span className="d-block">Kenneth Hune</span>
                            <span className="fs-12 d-block fw-normal text-muted">nneth.une@gmail.com</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-gray-200 text-dark">Récurrent</span>
                      </td>
                      <td>11/06/2023 10:53</td>
                      <td>
                        <span className="badge bg-soft-warning text-warning">Pas intéressé</span>
                      </td>
                      <td className="text-end">
                        <a href="#"><i className="feather-more-vertical"></i></a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-image">
                            <img src="/assets/images/avatar/6.png" alt="" className="img-fluid" />
                          </div>
                          <a href="#">
                            <span className="d-block">Valentine Maton</span>
                            <span className="fs-12 d-block fw-normal text-muted">alenine.aton@gmail.com</span>
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-gray-200 text-dark">Envoyé</span>
                      </td>
                      <td>11/06/2023 10:53</td>
                      <td>
                        <span className="badge bg-soft-success text-success">Terminé</span>
                      </td>
                      <td className="text-end">
                        <a href="#"><i className="feather-more-vertical"></i></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer">
              <ul className="list-unstyled d-flex align-items-center gap-2 mb-0 pagination-common-style">
                <li>
                  <a href="#"><i className="bi bi-arrow-left"></i></a>
                </li>
                <li><a href="#" className="active">1</a></li>
                <li><a href="#">2</a></li>
                <li>
                  <a href="#"><i className="bi bi-dot"></i></a>
                </li>
                <li><a href="#">8</a></li>
                <li><a href="#">9</a></li>
                <li>
                  <a href="#"><i className="bi bi-arrow-right"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* [Latest Leads] end */}
        
        {/* [Upcoming Schedule] start */}
        <div className="col-xxl-4">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Planning à venir</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="p-3 border border-dashed rounded-3 mb-3">
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="wd-50 ht-50 bg-soft-primary text-primary lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 schedule-date">
                      <span className="fs-18 fw-bold mb-1 d-block">20</span>
                      <span className="fs-10 fw-semibold text-uppercase d-block">Déc</span>
                    </div>
                    <div className="text-dark">
                      <a href="#" className="fw-bold mb-2 text-truncate-1-line">Design de tableau de bord React</a>
                      <span className="fs-11 fw-normal text-muted text-truncate-1-line">11:30am - 12:30pm</span>
                    </div>
                  </div>
                  <div className="img-group lh-0 ms-3 justify-content-start d-none d-sm-flex">
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Janette Dalton">
                      <img src="/assets/images/avatar/2.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Michael Ksen">
                      <img src="/assets/images/avatar/3.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Socrates Itumay">
                      <img src="/assets/images/avatar/4.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/6.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Explorer plus">
                      <i className="feather-more-horizontal"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-dashed rounded-3 mb-3">
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="wd-50 ht-50 bg-soft-warning text-warning lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 schedule-date">
                      <span className="fs-18 fw-bold mb-1 d-block">30</span>
                      <span className="fs-10 fw-semibold text-uppercase d-block">Déc</span>
                    </div>
                    <div className="text-dark">
                      <a href="#" className="fw-bold mb-2 text-truncate-1-line">Concept design admin</a>
                      <span className="fs-11 fw-normal text-muted text-truncate-1-line">10:00am - 12:00pm</span>
                    </div>
                  </div>
                  <div className="img-group lh-0 ms-3 justify-content-start d-none d-sm-flex">
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Janette Dalton">
                      <img src="/assets/images/avatar/2.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Michael Ksen">
                      <img src="/assets/images/avatar/3.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/5.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/6.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Explorer plus">
                      <i className="feather-more-horizontal"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-dashed rounded-3 mb-3">
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="wd-50 ht-50 bg-soft-success text-success lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 schedule-date">
                      <span className="fs-18 fw-bold mb-1 d-block">17</span>
                      <span className="fs-10 fw-semibold text-uppercase d-block">Déc</span>
                    </div>
                    <div className="text-dark">
                      <a href="#" className="fw-bold mb-2 text-truncate-1-line">Réunion d'équipe quotidienne</a>
                      <span className="fs-11 fw-normal text-muted text-truncate-1-line">8:00am - 9:00am</span>
                    </div>
                  </div>
                  <div className="img-group lh-0 ms-3 justify-content-start d-none d-sm-flex">
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Janette Dalton">
                      <img src="/assets/images/avatar/2.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Michael Ksen">
                      <img src="/assets/images/avatar/3.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Socrates Itumay">
                      <img src="/assets/images/avatar/4.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/5.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Explorer plus">
                      <i className="feather-more-horizontal"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-dashed rounded-3 mb-2">
                <div className="d-flex justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="wd-50 ht-50 bg-soft-danger text-danger lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 schedule-date">
                      <span className="fs-18 fw-bold mb-1 d-block">25</span>
                      <span className="fs-10 fw-semibold text-uppercase d-block">Déc</span>
                    </div>
                    <div className="text-dark">
                      <a href="#" className="fw-bold mb-2 text-truncate-1-line">Réunion Zoom d'équipe</a>
                      <span className="fs-11 fw-normal text-muted text-truncate-1-line">03:30pm - 05:30pm</span>
                    </div>
                  </div>
                  <div className="img-group lh-0 ms-3 justify-content-start d-none d-sm-flex">
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Janette Dalton">
                      <img src="/assets/images/avatar/2.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Socrates Itumay">
                      <img src="/assets/images/avatar/4.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/5.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-image avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Marianne Audrey">
                      <img src="/assets/images/avatar/6.png" className="img-fluid" alt="image" />
                    </a>
                    <a href="#" className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Explorer plus">
                      <i className="feather-more-horizontal"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center py-4">Planning à venir</a>
          </div>
        </div>
        {/* [Upcoming Schedule] end */}
        
        {/* [Project Status] start */}
        <div className="col-xxl-4">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Statut du projet</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body custom-card-action">
              <div className="mb-3">
                <div className="mb-4 pb-1 d-flex">
                  <div className="d-flex w-50 align-items-center me-3">
                    <img src="/assets/images/brand/app-store.png" alt="laravel-logo" className="me-3" width="35" />
                    <div>
                      <a href="#" className="text-truncate-1-line">Développement d'applications</a>
                      <div className="fs-11 text-muted">Applications</div>
                    </div>
                  </div>
                  <div className="d-flex flex-grow-1 align-items-center">
                    <div className="progress w-100 me-3 ht-5">
                      <div className="progress-bar bg-danger" role="progressbar" style={{width: '54%'}} aria-valuenow="54" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="text-muted">54%</span>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="mb-4 pb-1 d-flex">
                  <div className="d-flex w-50 align-items-center me-3">
                    <img src="/assets/images/brand/figma.png" alt="figma-logo" className="me-3" width="35" />
                    <div>
                      <a href="#" className="text-truncate-1-line">Design du tableau de bord</a>
                      <div className="fs-11 text-muted">Kit UI</div>
                    </div>
                  </div>
                  <div className="d-flex flex-grow-1 align-items-center">
                    <div className="progress w-100 me-3 ht-5">
                      <div className="progress-bar bg-primary" role="progressbar" style={{width: '86%'}} aria-valuenow="86" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="text-muted">86%</span>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="mb-4 pb-1 d-flex">
                  <div className="d-flex w-50 align-items-center me-3">
                    <img src="/assets/images/brand/facebook.png" alt="vue-logo" className="me-3" width="35" />
                    <div>
                      <a href="#" className="text-truncate-1-line">Marketing Facebook</a>
                      <div className="fs-11 text-muted">Marketing</div>
                    </div>
                  </div>
                  <div className="d-flex flex-grow-1 align-items-center">
                    <div className="progress w-100 me-3 ht-5">
                      <div className="progress-bar bg-success" role="progressbar" style={{width: '90%'}} aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="text-muted">90%</span>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="mb-4 pb-1 d-flex">
                  <div className="d-flex w-50 align-items-center me-3">
                    <img src="/assets/images/brand/github.png" alt="react-logo" className="me-3" width="35" />
                    <div>
                      <a href="#" className="text-truncate-1-line">Tableau de bord React Github</a>
                      <div className="fs-11 text-muted">Tableau de bord</div>
                    </div>
                  </div>
                  <div className="d-flex flex-grow-1 align-items-center">
                    <div className="progress w-100 me-3 ht-5">
                      <div className="progress-bar bg-info" role="progressbar" style={{width: '37%'}} aria-valuenow="37" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="text-muted">37%</span>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="d-flex">
                  <div className="d-flex w-50 align-items-center me-3">
                    <img src="/assets/images/brand/paypal.png" alt="sketch-logo" className="me-3" width="35" />
                    <div>
                      <a href="#" className="text-truncate-1-line">Passerelle de paiement Paypal</a>
                      <div className="fs-11 text-muted">Paiement</div>
                    </div>
                  </div>
                  <div className="d-flex flex-grow-1 align-items-center">
                    <div className="progress w-100 me-3 ht-5">
                      <div className="progress-bar bg-warning" role="progressbar" style={{width: '29%'}} aria-valuenow="29" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <span className="text-muted">29%</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center">Projets à venir</a>
          </div>
        </div>
        {/* [Project Status] end */}
        
        {/* [Team Progress] start */}
        <div className="col-xxl-4">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Progression de l'équipe</h5>
              <div className="card-header-action">
                <div className="card-header-btn">
                  <div data-bs-toggle="tooltip" title="Supprimer">
                    <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Actualiser">
                    <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                  </div>
                  <div data-bs-toggle="tooltip" title="Agrandir/Réduire">
                    <a href="#" className="avatar-text avatar-xs bg-success" data-bs-toggle="expand"> </a>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="#" className="avatar-text avatar-sm" data-bs-toggle="dropdown" data-bs-offset="25, 25">
                    <div data-bs-toggle="tooltip" title="Options">
                      <i className="feather-more-vertical"></i>
                    </div>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end">
                    <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>Nouveau</a>
                    <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Événement</a>
                    <a href="#" className="dropdown-item"><i className="feather-bell"></i>Différé</a>
                    <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Supprimé</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item"><i className="feather-settings"></i>Paramètres</a>
                    <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Astuces</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body custom-card-action">
              <div className="hstack justify-content-between border border-dashed rounded-3 p-3 mb-3">
                <div className="hstack gap-3">
                  <div className="avatar-image">
                    <img src="/assets/images/avatar/1.png" alt="" className="img-fluid" />
                  </div>
                  <div>
                    <a href="#">Alexandra Della</a>
                    <div className="fs-11 text-muted">Développeur frontend</div>
                  </div>
                </div>
                <div className="team-progress-1"></div>
              </div>
              <div className="hstack justify-content-between border border-dashed rounded-3 p-3 mb-3">
                <div className="hstack gap-3">
                  <div className="avatar-image">
                    <img src="/assets/images/avatar/2.png" alt="" className="img-fluid" />
                  </div>
                  <div>
                    <a href="#">Archie Cantones</a>
                    <div className="fs-11 text-muted">Designer UI/UX</div>
                  </div>
                </div>
                <div className="team-progress-2"></div>
              </div>
              <div className="hstack justify-content-between border border-dashed rounded-3 p-3 mb-3">
                <div className="hstack gap-3">
                  <div className="avatar-image">
                    <img src="/assets/images/avatar/3.png" alt="" className="img-fluid" />
                  </div>
                  <div>
                    <a href="#">Malanie Hanvey</a>
                    <div className="fs-11 text-muted">Développeur backend</div>
                  </div>
                </div>
                <div className="team-progress-3"></div>
              </div>
              <div className="hstack justify-content-between border border-dashed rounded-3 p-3 mb-2">
                <div className="hstack gap-3">
                  <div className="avatar-image">
                    <img src="/assets/images/avatar/4.png" alt="" className="img-fluid" />
                  </div>
                  <div>
                    <a href="#">Kenneth Hune</a>
                    <div className="fs-11 text-muted">Marketeur digital</div>
                  </div>
                </div>
                <div className="team-progress-4"></div>
              </div>
            </div>
            <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center">Mis à jour il y a 30 min</a>
          </div>
        </div>
        {/* [Team Progress] end */}
      </div>
    </div>
  )
}
