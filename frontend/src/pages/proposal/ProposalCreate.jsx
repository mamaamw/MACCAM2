import { useState } from 'react'

export default function ProposalCreate() {
  const [items, setItems] = useState([])

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }])
  }

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Créer une Proposition</h5>
              </div>
              <div className="card-body">
                <form>
                  {/* Client Info */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Client *</label>
                      <select className="form-select" required>
                        <option value="">Sélectionner un client</option>
                        <option>TechCorp Solutions</option>
                        <option>InnoTech Industries</option>
                        <option>Digital Wave Co</option>
                        <option>GreenTech Ltd</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date d'expiration *</label>
                      <input type="date" className="form-control" required />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label className="form-label">Titre de la proposition *</label>
                      <input type="text" className="form-control" placeholder="Ex: Développement Site E-commerce" required />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows="4" placeholder="Description générale de la proposition"></textarea>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="mb-0">Éléments de la proposition</h6>
                      <button type="button" className="btn btn-sm btn-light-brand" onClick={addItem}>
                        <i className="feather-plus me-2"></i>
                        Ajouter un élément
                      </button>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="bg-light">
                          <tr>
                            <th style={{width: '40%'}}>Description</th>
                            <th style={{width: '15%'}}>Quantité</th>
                            <th style={{width: '20%'}}>Prix Unitaire</th>
                            <th style={{width: '20%'}}>Total</th>
                            <th style={{width: '5%'}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center text-muted py-4">
                                Aucun élément ajouté. Cliquez sur "Ajouter un élément" pour commencer.
                              </td>
                            </tr>
                          ) : (
                            items.map((item, idx) => (
                              <tr key={idx}>
                                <td><input type="text" className="form-control form-control-sm" placeholder="Description" /></td>
                                <td><input type="number" className="form-control form-control-sm" min="1" value={item.quantity} /></td>
                                <td><input type="number" className="form-control form-control-sm" placeholder="0.00" /></td>
                                <td className="fw-bold">0.00 €</td>
                                <td>
                                  <button type="button" className="btn btn-sm btn-icon btn-light-danger" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                                    <i className="feather-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        <tfoot className="bg-light">
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">Sous-total</td>
                            <td className="fw-bold">0.00 €</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end">TVA (20%)</td>
                            <td>0.00 €</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold fs-6">TOTAL</td>
                            <td className="fw-bold fs-6 text-primary">0.00 €</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label className="form-label">Conditions et Notes</label>
                      <textarea className="form-control" rows="4" placeholder="Délai de réalisation, conditions de paiement, garanties, etc."></textarea>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-light-brand">
                      Enregistrer comme brouillon
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="feather-send me-2"></i>
                      Créer et Envoyer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
