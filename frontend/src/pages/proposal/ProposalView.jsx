export default function ProposalView() {
  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Proposition #PROP-2026-001</h5>
                <div className="card-header-action">
                  <div className="hstack gap-2">
                    <button className="btn btn-sm btn-light-brand">
                      <i className="feather-edit me-2"></i>Modifier
                    </button>
                    <button className="btn btn-sm btn-light-brand">
                      <i className="feather-download me-2"></i>Télécharger PDF
                    </button>
                    <button className="btn btn-sm btn-primary">
                      <i className="feather-send me-2"></i>Envoyer
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {/* Proposal Header */}
                <div className="row mb-5">
                  <div className="col-md-6">
                    <img src="/assets/images/logo/logo-full.png" alt="Logo" style={{maxWidth: '150px'}} />
                    <div className="mt-4">
                      <h6 className="fw-bold">MACCAM</h6>
                      <p className="text-muted mb-0">123 Avenue des Champs<br/>75008 Paris, France<br/>contact@maccam.com</p>
                    </div>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h3 className="mb-3">PROPOSITION COMMERCIALE</h3>
                    <div className="mb-2"><strong>N°:</strong> PROP-2026-001</div>
                    <div className="mb-2"><strong>Date:</strong> 15 Février 2026</div>
                    <div><strong>Valide jusqu'au:</strong> 15 Mars 2026</div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="row mb-5">
                  <div className="col-md-6">
                    <div className="card bg-soft-secondary">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Client</h6>
                        <p className="mb-1"><strong>TechCorp Solutions</strong></p>
                        <p className="text-muted mb-0">456 Rue de la Tech<br/>69003 Lyon, France<br/>contact@techcorp.fr</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead className="bg-light">
                      <tr>
                        <th>Description</th>
                        <th className="text-center">Quantité</th>
                        <th className="text-end">Prix Unitaire</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Développement Site E-commerce<br/><small className="text-muted">Frontend + Backend + CMS</small></td>
                        <td className="text-center">1</td>
                        <td className="text-end">30,000 €</td>
                        <td className="text-end fw-bold">30,000 €</td>
                      </tr>
                      <tr>
                        <td>Design UI/UX<br/><small className="text-muted">Maquettes + Prototypes</small></td>
                        <td className="text-center">1</td>
                        <td className="text-end">8,000 €</td>
                        <td className="text-end fw-bold">8,000 €</td>
                      </tr>
                      <tr>
                        <td>Intégration Paiement<br/><small className="text-muted">Stripe + PayPal</small></td>
                        <td className="text-center">1</td>
                        <td className="text-end">5,000 €</td>
                        <td className="text-end fw-bold">5,000 €</td>
                      </tr>
                      <tr>
                        <td>Formation<br/><small className="text-muted">2 jours de formation</small></td>
                        <td className="text-center">2</td>
                        <td className="text-end">1,000 €</td>
                        <td className="text-end fw-bold">2,000 €</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-light">
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">Sous-total</td>
                        <td className="text-end fw-bold">45,000 €</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end">TVA (20%)</td>
                        <td className="text-end">9,000 €</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold fs-5">TOTAL</td>
                        <td className="text-end fw-bold fs-5 text-primary">54,000 €</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Terms */}
                <div className="row">
                  <div className="col-12">
                    <h6 className="fw-bold mb-3">Conditions Générales</h6>
                    <ul className="text-muted">
                      <li>Délai de réalisation: 3 mois</li>
                      <li>Paiement: 30% à la signature, 40% à mi-parcours, 30% à la livraison</li>
                      <li>Garantie: 6 mois après livraison</li>
                      <li>Support: 3 mois de support compris</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
