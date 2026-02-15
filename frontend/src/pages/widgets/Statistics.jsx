export default function WidgetsStatistics() {
  return (
    <div className="main-content">
      <h4 className="mb-4">Widgets - Statistiques</h4>
      <div className="row">
        {['Utilisateurs','Ventes','Projets','Revenus'].map((title,i) => (
          <div key={i} className="col-lg-3">
            <div className="card">
              <div className="card-body">
                <div className="fs-24 fw-bold text-primary">{1245+i*100}</div>
                <div className="text-muted mt-2">{title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
