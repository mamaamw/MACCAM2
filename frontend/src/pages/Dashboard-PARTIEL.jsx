export default function Dashboard() {
  return (
    <>
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
                      <h3 className="fs-13 fw-semibold text-truncate-1-line">Invoices Awaiting Payment</h3>
                    </div>
                  </div>
                  <a href="#" className="">
                    <i className="feather-more-vertical"></i>
                  </a>
                </div>
                <div className="pt-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Invoices Awaiting </a>
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
                      <h3 className="fs-13 fw-semibold text-truncate-1-line">Converted Leads</h3>
                    </div>
                  </div>
                  <a href="#" className="">
                    <i className="feather-more-vertical"></i>
                  </a>
                </div>
                <div className="pt-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Converted Leads </a>
                    <div className="w-100 text-end">
                      <span className="fs-12 text-dark">52 Completed</span>
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
                      <h3 className="fs-13 fw-semibold text-truncate-1-line">Projects In Progress</h3>
                    </div>
                  </div>
                  <a href="#" className="">
                    <i className="feather-more-vertical"></i>
                  </a>
                </div>
                <div className="pt-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line">Projects In Progress </a>
                    <div className="w-100 text-end">
                      <span className="fs-12 text-dark">16 Completed</span>
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
                      <h3 className="fs-13 fw-semibold text-truncate-1-line">Conversion Rate</h3>
                    </div>
                  </div>
                  <a href="#" className="">
                    <i className="feather-more-vertical"></i>
                  </a>
                </div>
                <div className="pt-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <a href="#" className="fs-12 fw-medium text-muted text-truncate-1-line"> Conversion Rate </a>
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
                <h5 className="card-title">Payment Record</h5>
                <div className="card-header-action">
                  <div className="card-header-btn">
                    <div data-bs-toggle="tooltip" title="Delete">
                      <a href="#" className="avatar-text avatar-xs bg-danger" data-bs-toggle="remove"> </a>
                    </div>
                    <div data-bs-toggle="tooltip" title="Refresh">
                      <a href="#" className="avatar-text avatar-xs bg-warning" data-bs-toggle="refresh"> </a>
                    </div>
                    <div data-bs-toggle="tooltip" title="Maximize/Minimize">
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
                      <a href="#" className="dropdown-item"><i className="feather-at-sign"></i>New</a>
                      <a href="#" className="dropdown-item"><i className="feather-calendar"></i>Event</a>
                      <a href="#" className="dropdown-item"><i className="feather-bell"></i>Snoozed</a>
                      <a href="#" className="dropdown-item"><i className="feather-trash-2"></i>Deleted</a>
                      <div className="dropdown-divider"></div>
                      <a href="#" className="dropdown-item"><i className="feather-settings"></i>Settings</a>
                      <a href="#" className="dropdown-item"><i className="feather-life-buoy"></i>Tips & Tricks</a>
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
                      <div className="fs-12 text-muted mb-1">Awaiting</div>
                      <h6 className="fw-bold text-dark">$5,486</h6>
                      <div className="progress mt-2 ht-3">
                        <div className="progress-bar bg-primary" role="progressbar" style={{width: '81%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="p-3 border border-dashed rounded">
                      <div className="fs-12 text-muted mb-1">Completed</div>
                      <h6 className="fw-bold text-dark">$9,275</h6>
                      <div className="progress mt-2 ht-3">
                        <div className="progress-bar bg-success" role="progressbar" style={{width: '82%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="p-3 border border-dashed rounded">
                      <div className="fs-12 text-muted mb-1">Rejected</div>
                      <h6 className="fw-bold text-dark">$3,868</h6>
                      <div className="progress mt-2 ht-3">
                        <div className="progress-bar bg-danger" role="progressbar" style={{width: '68%'}}></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <div className="p-3 border border-dashed rounded">
                      <div className="fs-12 text-muted mb-1">Revenue</div>
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
                    <p className="text-reset m-0">Total Sales</p>
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
                      <span className="fs-12 text-muted">Development</span>
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">$1200</div>
                    <div className="fs-12 text-end">6 Projects</div>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="d-flex align-items-center justify-content-between">
                  <div className="hstack gap-3">
                    <div className="avatar-image avatar-lg p-2 rounded">
                      <img className="img-fluid" src="/assets/images/brand/app-store.png" alt="" />
                    </div>
                    <div>
                      <a href="#" className="d-block">iOS Apps Development</a>
                      <span className="fs-12 text-muted">Development</span>
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">$1450</div>
                    <div className="fs-12 text-end">3 Projects</div>
                  </div>
                </div>
                <hr className="border-dashed my-3" />
                <div className="d-flex align-items-center justify-content-between">
                  <div className="hstack gap-3">
                    <div className="avatar-image avatar-lg p-2 rounded">
                      <img className="img-fluid" src="/assets/images/brand/figma.png" alt="" />
                    </div>
                    <div>
                      <a href="#" className="d-block">Figma Dashboard Design</a>
                      <span className="fs-12 text-muted">UI/UX Design</span>
                    </div>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">$1250</div>
                    <div className="fs-12 text-end">5 Projects</div>
                  </div>
                </div>
              </div>
              <a href="#" className="card-footer fs-11 fw-bold text-uppercase text-center py-4">Full Details</a>
            </div>
          </div>
          {/* [Total Sales] end */}
        </div>
      </div>
    </>
  )
}
