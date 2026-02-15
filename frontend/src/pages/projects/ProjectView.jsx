export default function ProjectView() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Projet: Site E-commerce TechCorp</h5>
          <div className="card-header-action"><button className="btn btn-sm btn-primary">Modifier</button></div>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3"><strong>Client:</strong> TechCorp Solutions</div>
            <div className="col-md-3"><strong>Budget:</strong> 45,000 €</div>
            <div className="col-md-3"><strong>Progression:</strong> 75%</div>
            <div className="col-md-3"><strong>Statut:</strong> <span className="badge bg-soft-success text-success">En cours</span></div>
          </div>
          <div className="progress ht-10 mb-4">
            <div className="progress-bar bg-success" style={{width:'75%'}}>75%</div>
          </div>
          <h6>Description</h6>
          <p className="text-muted">Développement d'un site e-commerce complet avec système de paiement intégré.</p>
        </div>
      </div>
    </div>
  )
}
