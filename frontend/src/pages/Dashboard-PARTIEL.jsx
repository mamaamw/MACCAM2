export default function Dashboard() {
  return (
    <>
      <div className="main-content">
        <div className="row">
          {/* [Factures en attente de paiement] start */}
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
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Factures en attente</a>
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
          {/* [Factures en attente de paiement] end */}
          
          {/* [Prospects convertis] start */}
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
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Prospects convertis</a>
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
          {/* [Prospects convertis] end */}
          
          {/* [Projets en cours] start */}
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
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Projets en cours</a>
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
          {/* [Projets en cours] end */}
          
          {/* [Taux de conversion] start */}
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
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Taux de conversion</a>
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
          {/* [Taux de conversion] end */}
                    
          {/* [Historique de paiement] start */}
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
                      <div className="fs-12 text-muted mb-1">Revenus</div>
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
          {/* [Historique de paiement] end */}
          
          {/* [Ventes totales] start */}
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
                      <a href="#" className="d-block">Boutique eCommerce Shopify</a>
                      <span className="fs-12 text-muted">Développement</span>
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">$1200</div>
                    <div className="fs-12 text-end">6 projets</div>
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
                    <div className="fs-12 text-end">3 projets</div>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="d-flex align-items-center justify-content-between">
                  <div className="hstack gap-3">
                    <div className="avatar-image avatar-lg p-2 rounded">
                      <img className="img-fluid" src="/assets/images/brand/figma.png" alt="" />
                    </div>
                    <div>
                      <a href="#" className="d-block">Design de dashboard Figma</a>
                      <span className="fs-12 text-muted">Design UI/UX</span>
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">$1250</div>
                    <div className="fs-12 text-end">5 projets</div>
                  </div>
                </div>
              </div>
              <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center py-4">Détails complets</a>
            </div>
          </div>
          {/* [Ventes totales] end */}
        </div>
      </div>
    </>
  )
}
