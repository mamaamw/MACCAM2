export default function SettingsSEO() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header"><h5 className="card-title">Paramètres SEO</h5></div>
        <div className="card-body">
          <form>
            <div className="mb-3"><label className="form-label">Titre du Site</label><input type="text" className="form-control" placeholder="MACCAM CRM" /></div>
            <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" rows="3"></textarea></div>
            <div className="mb-3"><label className="form-label">Mots-clés</label><input type="text" className="form-control" /></div>
            <button className="btn btn-primary">Enregistrer</button>
          </form>
        </div>
      </div>
    </div>
  )
}
