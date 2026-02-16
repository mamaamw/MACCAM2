import { Link } from 'react-router-dom'
import { PDF_TOOLS } from './pdfToolsCatalog'

export default function PDFTools() {
  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      <div className="row g-3">
        {PDF_TOOLS.map((tool) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xxl-2" key={tool.title}>
            <Link to={`/apps/pdf-tools/${tool.slug}`} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm" style={{ transition: 'transform .15s ease' }}>
                <div className="card-body p-3 d-flex flex-column">
                  <div className={`avatar-text avatar-md rounded-3 bg-soft-secondary ${tool.color} mb-3`}>
                    <i className={tool.icon}></i>
                  </div>
                  <h6 className="mb-2 fw-bold text-dark">{tool.title}</h6>
                  <p className="mb-0 text-muted fs-12">{tool.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}

        <div className="col-12 col-sm-6 col-lg-4 col-xxl-2">
          <div className="card h-100 border-0" style={{ background: '#fdeae3' }}>
            <div className="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <span className="badge bg-soft-primary text-primary mb-2">Nouveau !</span>
                <h6 className="fw-bold">Créer un flux de travail</h6>
                <p className="text-muted fs-12 mb-0">
                  Créez des flux de travail personnalisés avec vos outils préférés, automatisez le traitement de vos tâches et réutilisez ces flux quand bon vous semble.
                </p>
              </div>
              <a href="#" className="text-dark fw-semibold mt-3" onClick={(event) => event.preventDefault()}>
                Créer un flux de travail <i className="feather-arrow-up-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
