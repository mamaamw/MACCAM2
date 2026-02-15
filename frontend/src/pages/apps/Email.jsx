export default function Email() {
  return (
    <>
      {/* [ Main Content ] start */}
      <main className="nxl-container apps-container apps-email">
        <div className="nxl-content without-header nxl-full-content">
          <div className="main-content d-flex">
            {/* Email Sidebar */}
            <div className="content-sidebar content-sidebar-md" data-scrollbar-target="#psScrollbarInit">
              <div className="content-sidebar-header bg-white sticky-top">
                <button className="btn btn-primary w-100">
                  <i className="feather-plus me-2"></i>
                  Nouveau Message
                </button>
              </div>
              
              <div className="content-sidebar-body">
                <ul className="nxl-navigation">
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link active">
                      <span className="nxl-micon"><i className="feather-inbox"></i></span>
                      <span className="nxl-mtext">Boîte de réception</span>
                      <span className="badge badge-soft-primary">24</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="nxl-micon"><i className="feather-star"></i></span>
                      <span className="nxl-mtext">Favoris</span>
                      <span className="badge badge-soft-warning">8</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="nxl-micon"><i className="feather-send"></i></span>
                      <span className="nxl-mtext">Envoyés</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="nxl-micon"><i className="feather-file-text"></i></span>
                      <span className="nxl-mtext">Brouillons</span>
                      <span className="badge badge-soft-info">3</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="nxl-micon"><i className="feather-trash-2"></i></span>
                      <span className="nxl-mtext">Corbeille</span>
                    </a>
                  </li>
                  <li className="nxl-item mt-4">
                    <span className="nxl-mtext text-muted text-uppercase fs-11">Libellés</span>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="wd-7 ht-7 bg-primary rounded-circle me-3"></span>
                      <span className="nxl-mtext">Travail</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="wd-7 ht-7 bg-success rounded-circle me-3"></span>
                      <span className="nxl-mtext">Personnel</span>
                    </a>
                  </li>
                  <li className="nxl-item">
                    <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                      <span className="wd-7 ht-7 bg-warning rounded-circle me-3"></span>
                      <span className="nxl-mtext">Important</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Email List */}
            <div className="content-area">
              <div className="content-area-header sticky-top">
                <div className="page-header-left d-flex align-items-center gap-2">
                  <a href="#" onClick={(e) => e.preventDefault()} className="app-sidebar-open-trigger me-2">
                    <i className="feather-menu"></i>
                  </a>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="selectAll" />
                  </div>
                  <div className="dropdown">
                    <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className="btn btn-md btn-light-brand">
                      <i className="feather-tag"></i>
                    </a>
                  </div>
                  <div className="dropdown">
                    <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className="btn btn-md btn-light-brand">
                      <i className="feather-more-vertical"></i>
                    </a>
                  </div>
                </div>
                <div className="page-header-right ms-auto">
                  <div className="hstack gap-2">
                    <input type="text" className="form-control" placeholder="Rechercher..." />
                    <button className="btn btn-md btn-light-brand">
                      <i className="feather-search"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="content-area-body pb-0">
                <div className="email-list-item">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="email-item d-flex align-items-center border-bottom p-4">
                      <div className="form-check me-3">
                        <input className="form-check-input" type="checkbox" />
                      </div>
                      <div className="avatar-text avatar-md bg-soft-primary text-primary me-3">
                        AD
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="mb-0 me-3">Alexandra Della</h6>
                          <span className="fs-11 text-muted">Il y a 2h</span>
                        </div>
                        <div className="fs-13 fw-semibold text-dark mb-1">Réunion projet Q1 2026</div>
                        <div className="fs-12 text-muted text-truncate-1-line">
                          Bonjour, je souhaite planifier une réunion pour discuter des objectifs du Q1...
                        </div>
                      </div>
                      <div className="ms-3">
                        <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm">
                          <i className="feather-star"></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* [ Main Content ] end */}
    </>
  )
}
