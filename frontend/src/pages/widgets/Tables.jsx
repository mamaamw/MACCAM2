export default function WidgetsTables() {
  return (
    <div className="main-content">
      <h4 className="mb-4">Widgets - Tableaux</h4>
      <div className="card">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead><tr><th>Nom</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td>Item 1</td><td><span className="badge bg-success">Actif</span></td><td><button className="btn btn-sm btn-light">Modifier</button></td></tr>
              <tr><td>Item 2</td><td><span className="badge bg-warning">En attente</span></td><td><button className="btn btn-sm btn-light">Modifier</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
