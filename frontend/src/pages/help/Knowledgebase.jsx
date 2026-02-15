export default function HelpKnowledgebase() {
  const articles = [
    {category:'Démarrage',title:'Comment créer un compte',icon:'user-plus'},
    {category:'Démarrage',title:'Premiers pas avec MACCAM',icon:'play-circle'},
    {category:'Clients',title:'Gérer vos clients',icon:'users'},
    {category:'Projets',title:'Créer un nouveau projet',icon:'briefcase'},
  ]
  
  return (
    <div className="main-content">
      <h4 className="mb-4">Base de Connaissance</h4>
      <div className="row">
        {articles.map((art,i) => (
          <div key={i} className="col-lg-6 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="hstack gap-3">
                  <div className="avatar-text bg-soft-primary text-primary"><i className={`feather-${art.icon}`}></i></div>
                  <div>
                    <span className="badge bg-soft-secondary text-secondary mb-1">{art.category}</span>
                    <h6 className="mb-0">{art.title}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
