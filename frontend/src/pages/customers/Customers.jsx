import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { customerService } from '../../services/api'
import toast from 'react-hot-toast'

export default function Customers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch } = useQuery(
    ['customers', page, search],
    () => customerService.getAll({ page, search }),
    { keepPreviousData: true }
  )

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
    
    try {
      await customerService.delete(id)
      toast.success('Client supprimé avec succès')
      refetch()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Liste des Clients</h5>
                <div className="card-header-action">
                  <Link to="/customers/create" className="btn btn-primary">
                    <i className="feather-plus me-2"></i>
                    <span>Nouveau Client</span>
                  </Link>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="px-4 py-3 border-bottom">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="feather-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher un client..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Statut</th>
                        <th>Date création</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Chargement...</span>
                            </div>
                          </td>
                        </tr>
                      ) : data?.data?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            Aucun client trouvé
                          </td>
                        </tr>
                      ) : (
                        data?.data?.map((customer) => (
                          <tr key={customer.id} className="single-item">
                            <td>
                              <Link to={`/customers/${customer.id}`} className="hstack gap-3">
                                <div className="avatar-text avatar-md">
                                  {customer.companyName?.charAt(0) || customer.contactName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <span className="d-block fw-bold">{customer.companyName}</span>
                                  <span className="fs-12 text-muted">{customer.contactName}</span>
                                </div>
                              </Link>
                            </td>
                            <td>
                              <a href={`mailto:${customer.email}`}>{customer.email}</a>
                            </td>
                            <td>
                              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                            </td>
                            <td>
                              <span className={`badge ${
                                customer.status === 'active' ? 'bg-success' :
                                customer.status === 'inactive' ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {customer.status === 'active' ? 'Actif' :
                                 customer.status === 'inactive' ? 'Inactif' :
                                 'Désactivé'}
                              </span>
                            </td>
                            <td>
                              {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td>
                              <div className="hstack gap-2 justify-content-end">
                                <Link to={`/customers/${customer.id}`} className="avatar-text avatar-md">
                                  <i className="feather feather-eye"></i>
                                </Link>
                                <div className="dropdown">
                                  <a href="javascript:void(0)" className="avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-offset="0,21">
                                    <i className="feather feather-more-horizontal"></i>
                                  </a>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                      <Link className="dropdown-item" to={`/customers/${customer.id}/edit`}>
                                        <i className="feather feather-edit-3 me-3"></i>
                                        <span>Modifier</span>
                                      </Link>
                                    </li>
                                    <li className="dropdown-divider"></li>
                                    <li>
                                      <a 
                                        className="dropdown-item text-danger" 
                                        href="javascript:void(0)"
                                        onClick={() => handleDelete(customer.id)}
                                      >
                                        <i className="feather feather-trash-2 me-3"></i>
                                        <span>Supprimer</span>
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* [ Main Content ] end */}
    </>
  )
}

