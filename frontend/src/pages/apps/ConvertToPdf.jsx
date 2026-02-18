import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const CONVERSION_TYPES = [
  { 
    id: 'word', 
    title: 'Word en PDF', 
    icon: 'feather-file-text', 
    color: 'text-primary',
    accept: '.doc,.docx',
    description: 'Convertissez vos documents Word en PDF'
  },
  { 
    id: 'excel', 
    title: 'Excel en PDF', 
    icon: 'feather-grid', 
    color: 'text-success',
    accept: '.xls,.xlsx,.csv',
    description: 'Convertissez vos feuilles de calcul Excel en PDF'
  },
  { 
    id: 'powerpoint', 
    title: 'PowerPoint en PDF', 
    icon: 'feather-monitor', 
    color: 'text-warning',
    accept: '.ppt,.pptx',
    description: 'Convertissez vos présentations PowerPoint en PDF'
  },
  { 
    id: 'jpg', 
    title: 'Image en PDF', 
    icon: 'feather-image', 
    color: 'text-danger',
    accept: '.jpg,.jpeg,.png,.webp,.gif',
    description: 'Convertissez vos images en PDF'
  },
  { 
    id: 'html', 
    title: 'HTML en PDF', 
    icon: 'feather-code', 
    color: 'text-purple',
    accept: '.html,.htm',
    description: 'Convertissez vos pages HTML en PDF'
  }
]

export default function ConvertToPdf() {
  const [selectedType, setSelectedType] = useState('word')
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const currentType = CONVERSION_TYPES.find(t => t.id === selectedType)

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier')
      return
    }

    setIsProcessing(true)
    
    try {
      // Simuler la conversion
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`${files.length} fichier(s) converti(s) avec succès !`)
      setFiles([])
    } catch (error) {
      toast.error('Erreur lors de la conversion')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
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
          <p className="text-muted mb-0">Convertissez vos documents en format PDF</p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Retour
        </Link>
      </div>

      <div className="row g-3">
        {/* Type Selection */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Choisissez le type de fichier</h6>
              <div className="d-grid gap-2">
                {CONVERSION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`btn ${selectedType === type.id ? 'btn-primary' : 'btn-outline-secondary'} text-start d-flex align-items-center`}
                    onClick={() => {
                      setSelectedType(type.id)
                      setFiles([])
                    }}
                  >
                    <i className={`${type.icon} ${selectedType === type.id ? '' : type.color} me-2`}></i>
                    <span>{type.title}</span>
                  </button>
                ))}
              </div>

              {/* Info Card */}
              <div className="alert alert-light border mt-3 mb-0">
                <div className="d-flex">
                  <i className="feather-info text-primary me-2"></i>
                  <div>
                    <h6 className="mb-1 fs-13">Formats acceptés</h6>
                    <p className="mb-0 fs-12 text-muted">
                      {currentType?.accept.split(',').join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className={`${currentType?.icon} ${currentType?.color} me-2`}></i>
                {currentType?.title}
              </h6>
              <p className="text-muted mb-4">{currentType?.description}</p>

              {/* File Upload */}
              <div className="border rounded-3 p-4 bg-light mb-3 text-center">
                <input
                  type="file"
                  id="fileInput"
                  className="d-none"
                  accept={currentType?.accept}
                  multiple
                  onChange={handleFileSelect}
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="avatar-text avatar-xl rounded-3 bg-white text-primary mb-3 mx-auto">
                    <i className="feather-upload" style={{ fontSize: '32px' }}></i>
                  </div>
                  <h6 className="mb-2">Cliquez pour sélectionner des fichiers</h6>
                  <p className="text-muted mb-0 fs-13">
                    ou glissez-déposez vos fichiers ici
                  </p>
                </label>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-2">Fichiers sélectionnés ({files.length})</h6>
                  <div className="d-flex flex-column gap-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between border rounded p-2 bg-white"
                      >
                        <div className="d-flex align-items-center flex-grow-1 text-truncate me-2">
                          <i className={`${currentType?.icon} ${currentType?.color} me-2`}></i>
                          <span className="text-truncate">{file.name}</span>
                          <span className="text-muted ms-2 fs-12">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => removeFile(index)}
                        >
                          <i className="feather-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Convert Button */}
              <button
                className="btn btn-primary w-100"
                onClick={handleConvert}
                disabled={files.length === 0 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Conversion en cours...
                  </>
                ) : (
                  <>
                    <i className="feather-refresh-cw me-2"></i>
                    Convertir en PDF
                  </>
                )}
              </button>

              {/* Info Alert */}
              <div className="alert alert-info border-0 mt-3 mb-0">
                <i className="feather-info me-2"></i>
                <strong>Note :</strong> Cette fonctionnalité nécessite un service backend pour la conversion réelle. 
                L'interface est prête et fonctionnelle.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
