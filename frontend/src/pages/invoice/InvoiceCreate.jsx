export default function InvoiceCreate() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h5 className="card-title">Créer une Facture</h5></div>
        <div className="card-body">
          <form>
            <div className="row mb-4">
              <div className="col-md-6"><label className="form-label">Client *</label><select className="form-select"><option>Sélectionner un client</option></select></div>
              <div className="col-md-6"><label className="form-label">Date *</label><input type="date" className="form-control" /></div>
            </div>
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="bg-light"><tr><th>Description</th><th>Qté</th><th>Prix U.</th><th>Total</th><th></th></tr></thead>
                <tbody><tr><td colSpan="5" className="text-center text-muted py-4">Ajouter des éléments</td></tr></tbody>
              </table>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="submit" className="btn btn-primary"><i className="feather-check me-2"></i>Créer la Facture</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
