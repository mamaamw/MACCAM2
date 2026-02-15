export default function InvoiceView() {
  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Facture #INV-2026-001</h5>
          <div className="card-header-action"><button className="btn btn-sm btn-primary"><i className="feather-download me-2"></i>Télécharger PDF</button></div>
        </div>
        <div className="card-body">
          <div className="row mb-5">
            <div className="col-md-6"><img src="/assets/images/logo/logo-full.png" alt="" style={{maxWidth:'150px'}} /><div className="mt-3"><strong>MACCAM</strong><br/>123 Avenue des Champs<br/>75008 Paris</div></div>
            <div className="col-md-6 text-md-end"><h3>FACTURE</h3><div><strong>N°:</strong> INV-2026-001</div><div><strong>Date:</strong> 15 Février 2026</div></div>
          </div>
          <div className="table-responsive mb-4">
            <table className="table table-bordered">
              <thead className="bg-light"><tr><th>Description</th><th className="text-center">Qté</th><th className="text-end">Prix U.</th><th className="text-end">Total</th></tr></thead>
              <tbody>
                <tr><td>Développement Web</td><td className="text-center">1</td><td className="text-end">12,500 €</td><td className="text-end fw-bold">12,500 €</td></tr>
              </tbody>
              <tfoot className="bg-light">
                <tr><td colSpan="3" className="text-end fw-bold">Total HT</td><td className="text-end fw-bold">12,500 €</td></tr>
                <tr><td colSpan="3" className="text-end">TVA 20%</td><td className="text-end">2,500 €</td></tr>
                <tr><td colSpan="3" className="text-end fw-bold fs-5">TOTAL TTC</td><td className="text-end fw-bold fs-5 text-primary">15,000 €</td></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
