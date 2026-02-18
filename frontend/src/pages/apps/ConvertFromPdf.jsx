import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const CONVERSION_TYPES = [
  { 
    id: 'word', 
    title: 'PDF en Word', 
    icon: 'feather-file-text', 
    color: 'text-primary',
    outputFormat: '.docx',
    description: 'Convertissez vos PDF en documents Word éditables'
  },
  { 
    id: 'excel', 
    title: 'PDF en Excel', 
    icon: 'feather-grid', 
    color: 'text-success',
    outputFormat: '.xlsx',
    description: 'Exportez les données de vos PDF vers Excel'
  },
  { 
    id: 'powerpoint', 
    title: 'PDF en PowerPoint', 
    icon: 'feather-monitor', 
    color: 'text-warning',
    outputFormat: '.pptx',
    description: 'Transformez vos PDF en présentations PowerPoint'
  },
  { 
    id: 'jpg', 
    title: 'PDF en Image', 
    icon: 'feather-image', 
    color: 'text-danger',
    outputFormat: '.jpg',
    description: 'Extrayez les pages de vos PDF en images'
  },
  { 
    id: 'pdfa', 
    title: 'PDF en PDF/A', 
    icon: 'feather-archive', 
    color: 'text-primary',
    outputFormat: '.pdf',
    description: 'Transformez votre PDF en PDF/A pour un archivage à long-terme'
  }
]

export default function ConvertFromPdf() {
  const [selectedType, setSelectedType] = useState('word')
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [options, setOptions] = useState({
    extractImages: false,
    allPages: true,
    pageRange: '1-10'
  })

  const currentType = CONVERSION_TYPES.find(t => t.id === selectedType)

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== selectedFiles.length) {
      toast.error('Seuls les fichiers PDF sont acceptés')
    }
    
    setFiles(pdfFiles)
  }

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier PDF')
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
            <span className="avatar-text avatar-md rounded-3 bg-soft-warning text-warning">
              <i className="feather-share-2"></i>
            </span>
            <span>Convertir depuis PDF</span>
          </h4>
          <p className="text-muted mb-0">Exportez vos PDF vers d'autres formats</p>
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
              <h6 className="mb-3">Choisissez le format de sortie</h6>
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

              {/* Options Card */}
              <div className="card border mt-3 mb-0">
                <div className="card-body p-3">
                  <h6 className="mb-3 fs-13">Options de conversion</h6>
                  
                  {selectedType === 'jpg' && (
                    <>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="extractImages"
                          checked={options.extractImages}
                          onChange={(e) => setOptions(prev => ({ ...prev, extractImages: e.target.checked }))}
                        />
                        <label className="form-check-label fs-13" htmlFor="extractImages">
                          Extraire uniquement les images
                        </label>
                      </div>
                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="allPages"
                          checked={options.allPages}
                          onChange={(e) => setOptions(prev => ({ ...prev, allPages: e.target.checked }))}
                        />
                        <label className="form-check-label fs-13" htmlFor="allPages">
                          Toutes les pages
                        </label>
                      </div>
                      {!options.allPages && (
                        <div className="mb-0">
                          <label className="form-label fs-13">Pages à extraire</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Ex: 1-5,8,10"
                            value={options.pageRange}
                            onChange={(e) => setOptions(prev => ({ ...prev, pageRange: e.target.value }))}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedType !== 'jpg' && (
                    <div className="alert alert-light border-0 mb-0 p-2">
                      <p className="mb-0 fs-12 text-muted">
                        <i className="feather-check-circle text-success me-1"></i>
                        Conversion automatique avec préservation du formatage
                      </p>
                    </div>
                  )}
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
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <div className="avatar-text avatar-xl rounded-3 bg-white text-danger mb-3 mx-auto">
                    <i className="feather-file" style={{ fontSize: '32px' }}></i>
                  </div>
                  <h6 className="mb-2">Cliquez pour sélectionner des fichiers PDF</h6>
                  <p className="text-muted mb-0 fs-13">
                    ou glissez-déposez vos PDF ici
                  </p>
                </label>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-2">Fichiers PDF sélectionnés ({files.length})</h6>
                  <div className="d-flex flex-column gap-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center justify-content-between border rounded p-2 bg-white"
                      >
                        <div className="d-flex align-items-center flex-grow-1 text-truncate me-2">
                          <i className="feather-file text-danger me-2"></i>
                          <span className="text-truncate">{file.name}</span>
                          <span className="text-muted ms-2 fs-12">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="feather-arrow-right text-muted"></i>
                          <i className={`${currentType?.icon} ${currentType?.color}`}></i>
                          <button
                            className="btn btn-sm btn-light text-danger ms-2"
                            onClick={() => removeFile(index)}
                          >
                            <i className="feather-x"></i>
                          </button>
                        </div>
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
                    Convertir en {currentType?.outputFormat.replace('.', '').toUpperCase()}
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
