import { Link } from 'react-router-dom'

export default function Proposal() {
  const proposals = [
    {id: 1, ref: 'PROP-2026-001', client: 'TechCorp Solutions', title: 'Développement Site E-commerce', montant: '45,000 €', statut: 'Envoyé', date: '15 Fév 2026', color: 'warning'},
    {id: 2, ref: 'PROP-2026-002', client: 'InnoTech Industries', title: 'Application Mobile iOS/Android', montant: '62,000 €', statut: 'Accepté', date: '12 Fév 2026', color: 'success'},
    {id: 3, ref: 'PROP-2026-003', client: 'Digital Wave Co', title: 'Refonte UI/UX', montant: '18,500 €', statut: 'Brouillon', date: '10 Fév 2026', color: 'secondary'},
    {id: 4, ref: 'PROP-2026-004', client: 'GreenTech Ltd', title: 'Système CRM Personnalisé', montant: '75,000 €', statut: 'En révision', date: '08 Fév 2026', color: 'info'},
  ]

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="mb-1">Propositions Commerciales</h4>
                <p className="mb-0 text-muted">Gérez vos propositions et devis</p>
              </div>
              <Link to="/proposal/create" className="btn btn-primary">
                <i className="feather-plus me-2"></i>
                Nouvelle Proposition
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Liste des Propositions</h5>
                <div className="card-header-action">
                  <div className="hstack gap-2">
                    <input type="text" className="form-control form-control-sm" placeholder="Rechercher..." />
                    <select className="form-select form-select-sm" style={{width: 'auto'}}>
                      <option>Tous les statuts</option>
                      <option>Brouillon</option>
                      <option>Envoyé</option>
                      <option>Accepté</option>
                      <option>Refusé</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Client</th>
                        <th>Titre</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposals.map((prop) => (
                        <tr key={prop.id}>
                          <td><span className="fw-bold text-primary">{prop.ref}</span></td>
                          <td>{prop.client}</td>
                          <td>{prop.title}</td>
                          <td><span className="fw-bold">{prop.montant}</span></td>
                          <td><span className="text-muted">{prop.date}</span></td>
                          <td><span className={`badge bg-soft-${prop.color} text-${prop.color}`}>{prop.statut}</span></td>
                          <td className="text-end">
                            <div className="hstack gap-2 justify-content-end">
                              <Link to="/proposal/view" className="avatar-text avatar-sm" title="Voir">
                                <i className="feather-eye"></i>
                              </Link>
                              <Link to="/proposal/edit" className="avatar-text avatar-sm" title="Modifier">
                                <i className="feather-edit"></i>
                              </Link>
                              <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-sm" title="Télécharger">
                                <i className="feather-download"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
