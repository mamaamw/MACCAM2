export default function SettingsTags() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h5 className="card-title">Gestion des Tags</h5></div>
        <div className="card-body">
          <button className="btn btn-primary mb-3">Ajouter un Tag</button>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead><tr><th>Nom</th><th>Couleur</th><th>Actions</th></tr></thead>
              <tbody>
                <tr><td>Important</td><td><span className="badge bg-danger">Rouge</span></td><td><button className="btn btn-sm btn-light">Modifier</button></td></tr>
                <tr><td>Urgent</td><td><span className="badge bg-warning">Jaune</span></td><td><button className="btn btn-sm btn-light">Modifier</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
