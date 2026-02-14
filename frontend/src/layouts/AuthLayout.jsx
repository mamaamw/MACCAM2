import { Outlet } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="nxl-container">
      <div className="nxl-auth-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-7">
                <div className="text-center mb-5">
                  <img src="/assets/images/logo-full.png" alt="MACCAM" className="mb-4" style={{maxHeight: '80px'}} />
                  <h2 className="fw-bold">Bienvenue sur MACCAM CRM</h2>
                  <p className="text-muted">Gérez votre entreprise efficacement</p>
                </div>
                {children || <Outlet />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
