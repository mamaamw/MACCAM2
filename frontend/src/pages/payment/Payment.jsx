export default function Payment() {
  const payments = [
    {id: 1, ref:'PAY-001', client: 'TechCorp', montant: '12,500 €', date: '15 Fév 2026', methode: 'Virement', statut:'Reçu', color:'success'},
    {id: 2, ref:'PAY-002', client: 'InnoTech', montant: '8,750 €', date: '12 Fév 2026', methode: 'Carte', statut:'En attente', color:'warning'},
  ]
  
  return (
    <div className="main-content">
      <div className="row">
        <div className="col-lg-12">
          <div className="card stretch stretch-full">
            <div className="card-header">
              <h5 className="card-title">Paiements</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr><th>Réf.</th><th>Client</th><th>Montant</th><th>Date</th><th>Méthode</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td className="fw-bold">{p.ref}</td>
                        <td>{p.client}</td>
                        <td className="fw-bold">{p.montant}</td>
                        <td>{p.date}</td>
                        <td><span className="badge bg-soft-info text-info">{p.methode}</span></td>
                        <td><span className={`badge bg-soft-${p.color} text-${p.color}`}>{p.statut}</span></td>
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
  )
}
