import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function ConvertToPdf() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showFormatsModal, setShowFormatsModal] = useState(false)
  const fileInputRef = useRef(null)

  // Extensions supportées (pour validation côté frontend)
  const supportedExtensions = {
    images: ['jpg', 'jpeg', 'jfif', 'jpe', 'jfi', 'png', 'gif', 'bmp', 'dib', 'webp', 'avif', 'heic', 'heif', 'tiff', 'tif', 'svg', 'ico', 'cur'],
    office: ['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm', 'xls', 'xlsx', 'xlt', 'xltx', 'xlsm', 'xltm', 'xlsb', 'csv', 'ppt', 'pptx', 'pot', 'potx', 'pps', 'ppsx', 'pptm', 'potm', 'ppsm', 'odt', 'ott', 'ods', 'ots', 'odp', 'otp', 'odg', 'otg', 'odf', 'sxw', 'stw', 'sxc', 'stc', 'sxi', 'sti'],
    web: ['html', 'htm', 'xhtml', 'mhtml', 'mht'],
    text: ['txt', 'text', 'rtf', 'md', 'markdown', 'log', 'csv', 'xml', 'json', 'yaml', 'yml', 'ini', 'conf', 'config', 'properties', 'sql', 'sh', 'bash', 'bat', 'cmd', 'ps1']
  }

  const allSupportedExtensions = [
    ...supportedExtensions.images,
    ...supportedExtensions.office,
    ...supportedExtensions.web,
    ...supportedExtensions.text
  ]

  const isExtensionSupported = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    return allSupportedExtensions.includes(ext)
  }

  const getExtensionCategory = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (supportedExtensions.images.includes(ext)) return 'Images'
    if (supportedExtensions.office.includes(ext)) return 'Documents Office'
    if (supportedExtensions.web.includes(ext)) return 'Pages Web'
    if (supportedExtensions.text.includes(ext)) return 'Fichiers Texte'
    return null
  }

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validation de l'extension
      if (!isExtensionSupported(selectedFile.name)) {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase()
        toast.error(
          <div>
            <strong>Format non supporté : .{ext}</strong>
            <br />
            <small>
              Veuillez sélectionner un fichier parmi les 60+ formats supportés.
              {' '}<button 
                onClick={() => setShowFormatsModal(true)}
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                Voir la liste
              </button>
            </small>
          </div>,
          {
            duration: 4000,
            style: {
              maxWidth: '500px'
            }
          }
        )
        // Réinitialiser l'input
        if (event.target) {
          event.target.value = ''
        }
        return
      }
      
      // Afficher un message selon la catégorie
      const category = getExtensionCategory(selectedFile.name)
      if (category === 'Documents Office' || category === 'Pages Web') {
        toast.info(
          <div>
            <strong>{category} détecté</strong>
            <br />
            <small>Nécessite LibreOffice installé sur le serveur</small>
          </div>,
          { duration: 3000 }
        )
      }
      
      setFile(selectedFile)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      
      // Validation de l'extension
      if (!isExtensionSupported(droppedFile.name)) {
        const ext = droppedFile.name.split('.').pop()?.toLowerCase()
        toast.error(
          <div>
            <strong>Format non supporté : .{ext}</strong>
            <br />
            <small>
              Veuillez déposer un fichier parmi les 60+ formats supportés.
              {' '}<button 
                onClick={() => setShowFormatsModal(true)}
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                Voir la liste
              </button>
            </small>
          </div>,
          {
            duration: 4000,
            style: {
              maxWidth: '500px'
            }
          }
        )
        return
      }
      
      // Afficher un message selon la catégorie
      const category = getExtensionCategory(droppedFile.name)
      if (category === 'Documents Office' || category === 'Pages Web') {
        toast.info(
          <div>
            <strong>{category} détecté</strong>
            <br />
            <small>Nécessite LibreOffice installé sur le serveur</small>
          </div>,
          { duration: 3000 }
        )
      }
      
      setFile(droppedFile)
    }
  }

  const handleConvert = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Note: On ne définit pas Content-Type car le navigateur doit le faire automatiquement
      // avec le boundary correct pour multipart/form-data
      const response = await api.post('/convert-to-pdf', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': undefined  // Laisse le navigateur définir le Content-Type avec boundary
        }
      })

      // Créer un lien de téléchargement pour le PDF
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name.replace(/\.[^/.]+$/, '') + '.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Fichier converti avec succès !')
      setFile(null)
    } catch (error) {
      console.error('Erreur conversion:', error)
      
      // Si la réponse est un blob, le convertir en texte pour lire le message d'erreur
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text()
          const errorData = JSON.parse(text)
          
          // Message d'erreur personnalisé
          if (errorData.message?.includes('Format de fichier non supporté')) {
            const ext = errorData.message.match(/\.(\w+)/)?.[0] || ''
            toast.error(
              <div>
                <strong>Format non supporté : {ext}</strong>
                <br />
                <small>Ce type de fichier ne peut pas être converti en PDF.</small>
              </div>,
              {
                duration: 5000,
                style: {
                  maxWidth: '500px'
                }
              }
            )
          } else if (errorData.message?.includes('LibreOffice')) {
            toast.error(
              <div>
                <strong>LibreOffice requis</strong>
                <br />
                <small>{errorData.message}</small>
              </div>,
              {
                duration: 5000,
                style: {
                  maxWidth: '500px'
                }
              }
            )
          } else {
            toast.error(errorData.message || 'Erreur lors de la conversion')
          }
        } catch (e) {
          toast.error('Erreur lors de la conversion du fichier')
        }
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la conversion')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    
    // Word
    if (['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm', 'odt', 'ott', 'sxw', 'stw'].includes(ext)) return 'feather-file-text'
    // Excel
    if (['xls', 'xlsx', 'xlt', 'xltx', 'xlsm', 'xltm', 'xlsb', 'csv', 'ods', 'ots', 'sxc', 'stc'].includes(ext)) return 'feather-grid'
    // PowerPoint
    if (['ppt', 'pptx', 'pot', 'potx', 'pps', 'ppsx', 'pptm', 'potm', 'ppsm', 'odp', 'otp', 'sxi', 'sti'].includes(ext)) return 'feather-monitor'
    // Images
    if (['jpg', 'jpeg', 'jfif', 'jpe', 'jfi', 'png', 'gif', 'bmp', 'dib', 'webp', 'avif', 'heic', 'heif', 'tiff', 'tif', 'svg', 'ico', 'cur'].includes(ext)) return 'feather-image'
    // HTML/Web
    if (['html', 'htm', 'xhtml', 'mhtml', 'mht'].includes(ext)) return 'feather-code'
    // Text/Code
    if (['txt', 'text', 'rtf', 'md', 'markdown', 'log', 'xml', 'json', 'yaml', 'yml', 'ini', 'conf', 'config', 'properties', 'sql', 'sh', 'bash', 'bat', 'cmd', 'ps1'].includes(ext)) return 'feather-file-text'
    return 'feather-file'
  }

  const getFileColor = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    
    // Word - Blue
    if (['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm', 'odt', 'ott', 'sxw', 'stw'].includes(ext)) return 'text-primary'
    // Excel - Green
    if (['xls', 'xlsx', 'xlt', 'xltx', 'xlsm', 'xltm', 'xlsb', 'csv', 'ods', 'ots', 'sxc', 'stc'].includes(ext)) return 'text-success'
    // PowerPoint - Orange
    if (['ppt', 'pptx', 'pot', 'potx', 'pps', 'ppsx', 'pptm', 'potm', 'ppsm', 'odp', 'otp', 'sxi', 'sti'].includes(ext)) return 'text-warning'
    // Images - Red
    if (['jpg', 'jpeg', 'jfif', 'jpe', 'jfi', 'png', 'gif', 'bmp', 'dib', 'webp', 'avif', 'heic', 'heif', 'tiff', 'tif', 'svg', 'ico', 'cur'].includes(ext)) return 'text-danger'
    // HTML - Purple
    if (['html', 'htm', 'xhtml', 'mhtml', 'mht'].includes(ext)) return 'text-purple'
    // Text - Info
    if (['txt', 'text', 'rtf', 'md', 'markdown', 'log', 'xml', 'json', 'yaml', 'yml', 'ini', 'conf', 'config', 'properties', 'sql', 'sh', 'bash', 'bat', 'cmd', 'ps1'].includes(ext)) return 'text-info'
    return 'text-secondary'
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <span className="avatar-text avatar-md rounded-3 bg-soft-primary text-primary">
              <i className="feather-file-plus"></i>
            </span>
            <span>Convertir en PDF</span>
          </h4>
          <p className="text-muted mb-0">Convertissez n'importe quel fichier en format PDF</p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Retour
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="avatar-text avatar-xl rounded-3 bg-soft-primary text-primary mb-3 mx-auto">
                  <i className="feather-refresh-cw" style={{ fontSize: '32px' }}></i>
                </div>
                <h5 className="mb-2">Conversion universelle en PDF</h5>
                <p className="text-muted mb-0">
                  Supporte 60+ formats : Word, Excel, PowerPoint, Images, HTML, Texte et plus
                </p>
              </div>

              {/* File Upload Area */}
              <div
                className={`border rounded-3 p-5 mb-4 text-center position-relative ${
                  dragActive ? 'bg-primary bg-opacity-10 border-primary' : 'bg-light'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="fileInput"
                  className="d-none"
                  onChange={handleFileSelect}
                />
                <label htmlFor="fileInput" className="cursor-pointer w-100">
                  <div className="avatar-text avatar-xl rounded-3 bg-white text-primary mb-3 mx-auto">
                    <i className="feather-upload" style={{ fontSize: '40px' }}></i>
                  </div>
                  <h6 className="mb-2">Cliquez pour sélectionner un fichier</h6>
                  <p className="text-muted mb-0 fs-13">
                    ou glissez-déposez votre fichier ici
                  </p>
                  <p className="text-muted mt-2 mb-0 fs-12">
                    <i className="feather-info me-1"></i>
                    60+ formats supportés (Office, Images, Web, Texte, etc.)
                  </p>
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="mb-4">
                  <h6 className="mb-3">Fichier sélectionné</h6>
                  <div className="border rounded-3 p-3 bg-white">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center flex-grow-1 text-truncate me-3">
                        <div className={`avatar-text avatar-md rounded-2 ${getFileColor(file.name)} bg-opacity-10 me-3`}>
                          <i className={`${getFileIcon(file.name)} ${getFileColor(file.name)}`}></i>
                        </div>
                        <div className="flex-grow-1 text-truncate">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mb-0 text-truncate">{file.name}</h6>
                            {(getExtensionCategory(file.name) === 'Documents Office' || 
                              getExtensionCategory(file.name) === 'Pages Web') && (
                              <span className="badge bg-warning text-dark flex-shrink-0">
                                <i className="feather-alert-circle" style={{ fontSize: '10px' }}></i>
                                {' '}LibreOffice requis
                              </span>
                            )}
                          </div>
                          <p className="text-muted mb-0 fs-12">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {file.type && <span className="ms-2">• {file.type}</span>}
                            <span className="ms-2">• {getExtensionCategory(file.name) || 'Autre'}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-light text-danger"
                        onClick={removeFile}
                        disabled={isProcessing}
                      >
                        <i className="feather-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                className="btn btn-primary btn-lg w-100 mb-3"
                onClick={handleConvert}
                disabled={!file || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Conversion en cours...
                  </>
                ) : (
                  <>
                    <i className="feather-download me-2"></i>
                    Convertir et Télécharger le PDF
                  </>
                )}
              </button>

              {/* Info Alert */}
              <div className="alert alert-light border mb-0">
                <div className="d-flex">
                  <i className="feather-info text-primary me-2 mt-1"></i>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 fs-13">Formats supportés (60+ extensions)</h6>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowFormatsModal(true)}
                      >
                        <i className="feather-list me-1"></i>
                        Voir tous
                      </button>
                    </div>
                    <div className="row g-2 fs-11 text-muted">
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>Word:</strong> .doc, .docx, .dot, .dotx, .odt, .rtf
                      </div>
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>Excel:</strong> .xls, .xlsx, .xlsm, .ods, .csv
                      </div>
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>PowerPoint:</strong> .ppt, .pptx, .pps, .ppsx, .odp
                      </div>
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>Images:</strong> .jpg, .png, .gif, .bmp, .webp, .svg, .tiff, .heic, .avif
                      </div>
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>Web:</strong> .html, .htm, .xhtml, .mhtml
                      </div>
                      <div className="col-md-6">
                        <i className="feather-check text-success me-1"></i>
                        <strong>Texte:</strong> .txt, .md, .log, .json, .xml, .yaml, .ini, .sql
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal des formats supportés */}
      {showFormatsModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowFormatsModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-check-circle text-success me-2"></i>
                  Formats supportés (60+ extensions)
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowFormatsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Images */}
                <div className="mb-4">
                  <h6 className="d-flex align-items-center mb-3">
                    <i className="feather-image text-danger me-2"></i>
                    <strong>Images (18 formats)</strong>
                    <span className="badge bg-soft-success text-success ms-2">Conversion native</span>
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {supportedExtensions.images.map(ext => (
                      <span key={ext} className="badge bg-light text-dark border">.{ext}</span>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="feather-info me-1"></i>
                    Aucune installation requise - Conversion instantanée
                  </small>
                </div>

                {/* Documents Office */}
                <div className="mb-4">
                  <h6 className="d-flex align-items-center mb-3">
                    <i className="feather-file-text text-primary me-2"></i>
                    <strong>Documents Office (34 formats)</strong>
                    <span className="badge bg-soft-warning text-warning ms-2">Requière LibreOffice</span>
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {supportedExtensions.office.map(ext => (
                      <span key={ext} className="badge bg-light text-dark border">.{ext}</span>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="feather-alert-circle me-1"></i>
                    Nécessite LibreOffice installé sur le serveur
                  </small>
                </div>

                {/* Pages Web */}
                <div className="mb-4">
                  <h6 className="d-flex align-items-center mb-3">
                    <i className="feather-code text-purple me-2"></i>
                    <strong>Pages Web (5 formats)</strong>
                    <span className="badge bg-soft-warning text-warning ms-2">Requière LibreOffice</span>
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {supportedExtensions.web.map(ext => (
                      <span key={ext} className="badge bg-light text-dark border">.{ext}</span>
                    ))}
                  </div>
                </div>

                {/* Fichiers Texte */}
                <div className="mb-0">
                  <h6 className="d-flex align-items-center mb-3">
                    <i className="feather-file text-info me-2"></i>
                    <strong>Fichiers Texte & Code (17 formats)</strong>
                    <span className="badge bg-soft-success text-success ms-2">Conversion native</span>
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {supportedExtensions.text.map(ext => (
                      <span key={ext} className="badge bg-light text-dark border">.{ext}</span>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2">
                    <i className="feather-info me-1"></i>
                    Aucune installation requise - Conversion instantanée
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowFormatsModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
