export default function ProjectCreate() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h5 className="card-title">Créer un Projet</h5></div>
        <div className="card-body">
          <form>
            <div className="row mb-3">
              <div className="col-md-6"><label className="form-label">Nom du Projet *</label><input type="text" className="form-control" required /></div>
              <div className="col-md-6"><label className="form-label">Client *</label><select className="form-select"><option>Sélectionner</option></select></div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4"><label className="form-label">Date de début</label><input type="date" className="form-control" /></div>
              <div className="col-md-4"><label className="form-label">Date de fin</label><input type="date" className="form-control" /></div>
              <div className="col-md-4"><label className="form-label">Budget</label><input type="number" className="form-control" /></div>
            </div>
            <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="4"></textarea></div>
            <button type="submit" className="btn btn-primary">Créer le Projet</button>
          </form>
        </div>
      </div>
    </div>
  )
}
