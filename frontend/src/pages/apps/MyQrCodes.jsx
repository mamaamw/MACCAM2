import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import toast from '../../utils/toast'

export default function MyQrCodes() {
  const navigate = useNavigate()
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [renameModal, setRenameModal] = useState(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    loadQrCodes()
  }, [])

  const loadQrCodes = async () => {
    try {
      const response = await api.get('/qr-codes')
      setQrCodes(response.data.qrCodes || [])
    } catch (error) {
      console.error('Erreur chargement QR codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = (qrCode) => {
    // Sauvegarder temporairement le QR à charger dans le localStorage
    localStorage.setItem('qr-to-load', qrCode.id)
    navigate('/apps/qr-code')
  }

  const handleDuplicate = async (qrCode) => {
    try {
      await api.post('/qr-codes', {
        name: `${qrCode.name} (copie)`,
        type: qrCode.type,
        settings: qrCode.settings
      })
      loadQrCodes()
    } catch (error) {
      toast.error('Erreur lors de la duplication')
    }
  }

  const handleRename = async () => {
    if (!newName.trim() || !renameModal) return
    
    try {
      await api.put(`/qr-codes/${renameModal}`, { name: newName })
      setRenameModal(null)
      setNewName('')
      loadQrCodes()
    } catch (error) {
      toast.error('Erreur lors du renommage')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/qr-codes/${id}`)
      setDeleteConfirm(null)
      loadQrCodes()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      link: 'Lien',
      text: 'Texte',
      email: 'E-mail',
      call: 'Appel',
      sms: 'SMS',
      vcard: 'V-card',
      whatsapp: 'WhatsApp',
      wifi: 'Wi-Fi',
      pdf: 'PDF',
      app: 'App',
      images: 'Images',
      video: 'Vidéo',
      social: 'Social',
      event: 'Événement',
      barcode2d: 'Code-barres 2D'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Mes QR Codes</h2>
          <p className="text-muted mb-0">Gérez tous vos QR codes sauvegardés</p>
        </div>
        <Link to="/apps/qr-code" className="btn btn-primary">
          <i className="feather-plus me-2"></i>Créer un QR Code
        </Link>
      </div>

      {qrCodes.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="feather-inbox display-1 text-muted mb-3"></i>
            <h4>Aucun QR Code sauvegardé</h4>
            <p className="text-muted mb-4">Créez votre premier QR code pour le retrouver ici</p>
            <Link to="/apps/qr-code" className="btn btn-primary">
              <i className="feather-plus me-2"></i>Créer un QR Code
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {qrCodes.map((qr) => (
            <div key={qr.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h5 className="mb-1 text-truncate">{qr.name}</h5>
                      <small className="text-muted">
                        <i className="feather-tag me-1"></i>
                        {getTypeLabel(qr.type)}
                      </small>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="feather-clock me-1"></i>
                      {new Date(qr.updatedAt).toLocaleDateString('fr-FR')}
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-grow-1"
                      onClick={() => handleLoad(qr)}
                    >
                      <i className="feather-edit-2 me-1"></i>Charger
                    </button>
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => handleDuplicate(qr)}
                      title="Dupliquer"
                    >
                      <i className="feather-copy"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => { setRenameModal(qr.id); setNewName(qr.name) }}
                      title="Renommer"
                    >
                      <i className="feather-edit-3"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      onClick={() => setDeleteConfirm(qr.id)}
                      title="Supprimer"
                    >
                      <i className="feather-trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmer la suppression</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteConfirm(null)}></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer ce QR code ? Cette action est irréversible.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de renommage */}
      {renameModal && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Renommer le QR Code</h5>
                  <button type="button" className="btn-close" onClick={() => { setRenameModal(null); setNewName('') }}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Nouveau nom</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setRenameModal(null); setNewName('') }}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleRename}>
                    Renommer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
