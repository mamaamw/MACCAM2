import { Link } from 'react-router-dom'
import { PDF_CATEGORIES, PDF_TOOLS_BY_CATEGORY } from './pdfToolsCatalog'

export default function PDFTools() {
  return (
    <div className="container-fluid px-3 px-md-4 py-3" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      {/* Header */}
      <div className="mb-3">
        <h4 className="mb-1">Outils PDF</h4>
        <p className="text-muted mb-0 fs-13">Tous les outils dont vous avez besoin pour travailler avec vos fichiers PDF</p>
      </div>

      {/* Categories */}
      {PDF_CATEGORIES.map((category) => {
        const tools = PDF_TOOLS_BY_CATEGORY[category.id] || []
        if (tools.length === 0) return null

        return (
          <div key={category.id} className="mb-3">
            {/* Category Header */}
            <div className="d-flex align-items-center mb-2">
              <div className={`avatar-text avatar-sm rounded-2 bg-soft-secondary ${category.color} me-2`}>
                <i className={category.icon} style={{ fontSize: '16px' }}></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">{category.title}</h6>
                <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{category.description}</p>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="row g-2">
              {tools.map((tool) => (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={tool.slug}>
                  <Link to={`/apps/pdf-tools/${tool.slug}`} className="text-decoration-none">
                    <div 
                      className="card h-100 border-0 shadow-sm" 
                      style={{ 
                        transition: 'all .2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'
                      }}
                    >
                      <div className="card-body p-2">
                        <div className="d-flex align-items-start">
                          <div className={`avatar-text rounded-2 bg-soft-secondary ${tool.color} me-2 flex-shrink-0`} style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                            <i className={tool.icon}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '13px' }}>{tool.title}</h6>
                            <p className="mb-0 text-muted" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Workflow Card */}
      <div className="card border-0 shadow-sm mt-3" style={{ background: 'linear-gradient(135deg, #fdeae3 0%, #ffe8dc 100%)' }}>
        <div className="card-body p-3">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-start">
                <div className="avatar-text rounded-2 bg-white text-warning me-2" style={{ width: '40px', height: '40px' }}>
                  <i className="feather-zap"></i>
                </div>
                <div>
                  <span className="badge bg-soft-primary text-primary mb-1" style={{ fontSize: '10px' }}>Nouveau !</span>
                  <h6 className="mb-1 fw-bold">Créer un flux de travail personnalisé</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                    Créez des flux de travail personnalisés avec vos outils préférés, automatisez le traitement de vos tâches et réutilisez ces flux quand bon vous semble.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end mt-2 mt-lg-0">
              <a 
                href="#" 
                className="btn btn-dark btn-sm"
                onClick={(event) => event.preventDefault()}
              >
                Créer un flux de travail
                <i className="feather-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
