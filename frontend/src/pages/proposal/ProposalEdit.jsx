import { useState } from 'react'

export default function ProposalEdit() {
  const [items, setItems] = useState([
    { description: 'Développement Site E-commerce', quantity: 1, price: 30000 },
    { description: 'Design UI/UX', quantity: 1, price: 8000 },
  ])

  return (
    <>
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Modifier la Proposition #PROP-2026-001</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Client *</label>
                      <select className="form-select" value="techcorp" required>
                        <option value="techcorp">TechCorp Solutions</option>
                        <option>InnoTech Industries</option>
                        <option>Digital Wave Co</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date d'expiration *</label>
                      <input type="date" className="form-control" value="2026-03-15" required />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-12">
                      <label className="form-label">Titre *</label>
                      <input type="text" className="form-control" value="Développement Site E-commerce" required />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="mb-0">Éléments</h6>
                      <button type="button" className="btn btn-sm btn-light-brand">
                        <i className="feather-plus me-2"></i>Ajouter
                      </button>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="bg-light">
                          <tr>
                            <th style={{width:'40%'}}>Description</th>
                            <th style={{width:'15%'}}>Qté</th>
                            <th style={{width:'20%'}}>Prix U.</th>
                            <th style={{width:'20%'}}>Total</th>
                            <th style={{width:'5%'}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td><input type="text" className="form-control form-control-sm" value={item.description} /></td>
                              <td><input type="number" className="form-control form-control-sm" value={item.quantity} /></td>
                              <td><input type="number" className="form-control form-control-sm" value={item.price} /></td>
                              <td className="fw-bold">{(item.quantity * item.price).toLocaleString()} €</td>
                              <td>
                                <button type="button" className="btn btn-sm btn-icon btn-light-danger">
                                  <i className="feather-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-light">
                          <tr>
                            <td colSpan="3" className="text-end fw-bold">Sous-total</td>
                            <td className="fw-bold">38,000 €</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end">TVA (20%)</td>
                            <td>7,600 €</td>
                            <td></td>
                          </tr>
                          <tr>
                            <td colSpan="3" className="text-end fw-bold fs-6">TOTAL</td>
                            <td className="fw-bold fs-6 text-primary">45,600 €</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-light">Annuler</button>
                    <button type="submit" className="btn btn-primary">
                      <i className="feather-save me-2"></i>Enregistrer
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
