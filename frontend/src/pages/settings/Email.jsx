export default function SettingsEmail() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h5 className="card-title">Configuration Email</h5></div>
        <div className="card-body">
          <form>
            <div className="row mb-3">
              <div className="col-md-6"><label className="form-label">Serveur SMTP</label><input className="form-control" placeholder="smtp.gmail.com" /></div>
              <div className="col-md-6"><label className="form-label">Port</label><input type="number" className="form-control" placeholder="587" /></div>
            </div>
            <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" /></div>
            <button className="btn btn-primary">Enregistrer</button>
          </form>
        </div>
      </div>
    </div>
  )
}
