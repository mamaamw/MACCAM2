import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PDFDocument } from 'pdf-lib'
import toast from 'react-hot-toast'
import pdfMergeProjectService from '../../services/pdfMergeProjectService'

export default function MergePdf() {
  const [files, setFiles] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrls, setPreviewUrls] = useState({})
  const [savedProjects, setSavedProjects] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Cleanup preview URLs on unmount
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  useEffect(() => {
    // Charger les projets sauvegardés au montage du composant
    loadSavedProjects()
  }, [])

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    const newFiles = []
    const newPreviewUrls = { ...previewUrls }

    for (const file of selectedFiles) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} n'est pas un fichier PDF`)
        continue
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()

        const fileWithInfo = {
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          pageCount,
          selectedPages: Array.from({ length: pageCount }, (_, i) => i + 1)
        }

        newFiles.push(fileWithInfo)

        // Create preview URL
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
        newPreviewUrls[fileWithInfo.id] = URL.createObjectURL(blob)
      } catch (error) {
        toast.error(`Erreur lors du chargement de ${file.name}`)
        console.error(error)
      }
    }

    setFiles(prev => [...prev, ...newFiles])
    setPreviewUrls(newPreviewUrls)
    toast.success(`${newFiles.length} fichier(s) ajouté(s)`)
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (previewUrls[id]) {
      URL.revokeObjectURL(previewUrls[id])
      setPreviewUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[id]
        return newUrls
      })
    }
  }

  const moveFile = (index, direction) => {
    if (index + direction < 0 || index + direction >= files.length) return
    
    setFiles(prev => {
      const newFiles = [...prev]
      const temp = newFiles[index]
      newFiles[index] = newFiles[index + direction]
      newFiles[index + direction] = temp
      return newFiles
    })
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    setFiles(prev => {
      const newFiles = [...prev]
      const draggedFile = newFiles[draggedIndex]
      newFiles.splice(draggedIndex, 1)
      newFiles.splice(index, 0, draggedFile)
      return newFiles
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const togglePageSelection = (fileId, pageNumber) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f
      
      const selectedPages = f.selectedPages.includes(pageNumber)
        ? f.selectedPages.filter(p => p !== pageNumber)
        : [...f.selectedPages, pageNumber].sort((a, b) => a - b)
      
      return { ...f, selectedPages }
    }))
  }

  const selectAllPages = (fileId) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f
      return {
        ...f,
        selectedPages: Array.from({ length: f.pageCount }, (_, i) => i + 1)
      }
    }))
  }

  const deselectAllPages = (fileId) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== fileId) return f
      return { ...f, selectedPages: [] }
    }))
  }

  const mergePdfs = async () => {
    if (files.length < 2) {
      toast.error('Veuillez ajouter au moins 2 fichiers PDF')
      return
    }

    const hasSelectedPages = files.some(f => f.selectedPages.length > 0)
    if (!hasSelectedPages) {
      toast.error('Veuillez sélectionner au moins une page à fusionner')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const mergedPdf = await PDFDocument.create()
      const totalFiles = files.filter(f => f.selectedPages.length > 0).length
      let processedFiles = 0

      for (const fileInfo of files) {
        if (fileInfo.selectedPages.length === 0) continue

        const arrayBuffer = await fileInfo.file.arrayBuffer()
        const sourcePdf = await PDFDocument.load(arrayBuffer)
        
        // Copy selected pages
        const pageIndices = fileInfo.selectedPages.map(p => p - 1)
        const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices)
        
        copiedPages.forEach(page => {
          mergedPdf.addPage(page)
        })

        processedFiles++
        setProgress(Math.round((processedFiles / totalFiles) * 100))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      
      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('PDF fusionné avec succès !')
      
      // Reset
      setTimeout(() => {
        setFiles([])
        Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
        setPreviewUrls({})
        setProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Erreur lors de la fusion:', error)
      toast.error('Erreur lors de la fusion des PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const loadSavedProjects = async () => {
    try {
      console.log('Chargement des projets sauvegardés...')
      const response = await pdfMergeProjectService.getProjects()
      console.log('Projets reçus:', response)
      setSavedProjects(response.projects || [])
      console.log('Nombre de projets:', (response.projects || []).length)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
      toast.error('Erreur lors du chargement des projets')
    }
  }

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Veuillez entrer un nom de projet')
      return
    }

    if (files.length === 0) {
      toast.error('Aucun fichier à sauvegarder')
      return
    }

    console.log('=== SAUVEGARDE DU PROJET ===')
    console.log('Nombre de fichiers:', files.length)
    console.log('Fichiers détails:', files.map(f => ({
      id: f.id,
      name: f.name,
      hasFile: !!f.file,
      fileType: f.file?.type,
      fileName: f.file?.name,
      fileSize: f.file?.size
    })))

    setIsSaving(true)

    try {
      await pdfMergeProjectService.createProject({
        name: projectName,
        description: projectDescription,
        files
      })

      toast.success('Projet sauvegardé avec succès')
      setShowSaveModal(false)
      setProjectName('')
      setProjectDescription('')
      await loadSavedProjects()
    } catch (error) {
      console.error('Erreur sauvegarde projet:', error)
      toast.error('Erreur lors de la sauvegarde du projet')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadProject = async (projectId) => {
    console.log('handleLoadProject appelé avec:', projectId)
    setIsLoading(true)

    try {
      console.log('Récupération du projet et des fichiers...')
      const [projectResponse, filesResponse] = await Promise.all([
        pdfMergeProjectService.getProject(projectId),
        pdfMergeProjectService.getProjectFiles(projectId)
      ])

      console.log('Projet récupéré:', projectResponse)
      console.log('Fichiers récupérés:', filesResponse)

      const filesMetadata = JSON.parse(projectResponse.project.filesData)
      console.log('Métadonnées des fichiers:', filesMetadata)
      
      const newFiles = []
      const newPreviewUrls = {}

      for (const fileUrl of filesResponse.files) {
        console.log('Traitement du fichier:', fileUrl)
        // fileUrl.name = nom physique, fileUrl.originalName = nom original
        const physicalName = fileUrl.name
        const originalName = fileUrl.originalName || fileUrl.name

        try {
          console.log('Téléchargement du fichier:', physicalName)
          // Télécharger le fichier avec son nom physique
          const blob = await pdfMergeProjectService.downloadFile(projectId, physicalName)
          console.log('Fichier téléchargé, taille:', blob.size)
          
          // Créer le File avec le nom original
          const file = new File([blob], originalName, { type: 'application/pdf' })

          const fileWithInfo = {
            file,
            id: `${originalName}-${Date.now()}-${Math.random()}`,
            name: originalName,
            size: blob.size,
            pageCount: fileUrl.pageCount,
            selectedPages: fileUrl.selectedPages
          }

          newFiles.push(fileWithInfo)
          newPreviewUrls[fileWithInfo.id] = URL.createObjectURL(blob)
        } catch (error) {
          console.error(`Erreur chargement fichier ${physicalName}:`, error)
          toast.error(`Erreur lors du chargement de ${originalName}`)
        }
      }

      console.log('Fichiers chargés:', newFiles.length)
      setFiles(newFiles)
      setPreviewUrls(newPreviewUrls)
      setShowLoadModal(false)
      toast.success(`Projet chargé avec succès (${newFiles.length} fichier(s))`)
    } catch (error) {
      console.error('Erreur chargement projet:', error)
      toast.error(`Erreur lors du chargement du projet: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return
    }

    try {
      await pdfMergeProjectService.deleteProject(projectId)
      toast.success('Projet supprimé avec succès')
      await loadSavedProjects()
    } catch (error) {
      console.error('Erreur suppression projet:', error)
      toast.error('Erreur lors de la suppression du projet')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const totalPages = files.reduce((sum, f) => sum + f.selectedPages.length, 0)

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <span className="avatar-text avatar-md rounded-3 bg-soft-secondary text-danger">
              <i className="feather-git-merge"></i>
            </span>
            <span>Fusionner PDF</span>
          </h4>
          <p className="text-muted mb-0">
            Fusionnez et combinez des fichiers PDF dans l'ordre que vous souhaitez
          </p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Tous les outils
        </Link>
      </div>

      <div className="row g-3">
        {/* Left Column - File Selection */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="mb-0">
                  <i className="feather-upload-cloud me-2"></i>
                  Sélectionner les fichiers PDF
                </h6>
                {files.length > 0 && (
                  <span className="badge bg-primary">{files.length} fichier(s)</span>
                )}
              </div>

              <div 
                className="border-2 border-dashed rounded-3 p-4 text-center"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.backgroundColor = '#e9ecef'
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  const dt = e.dataTransfer
                  if (dt.files) {
                    fileInputRef.current.files = dt.files
                    handleFileSelect({ target: { files: dt.files } })
                  }
                }}
              >
                <i className="feather-file-plus" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                <h5 className="mt-3 mb-2">Glissez-déposez vos fichiers PDF ici</h5>
                <p className="text-muted mb-3">ou cliquez pour parcourir</p>
                <button className="btn btn-primary" onClick={(e) => e.stopPropagation()}>
                  <i className="feather-folder me-2"></i>
                  Choisir des fichiers
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0">
                    <i className="feather-layers me-2"></i>
                    Ordre de fusion
                  </h6>
                  <small className="text-muted">
                    Glissez-déposez pour réorganiser
                  </small>
                </div>

                <div className="d-flex flex-column gap-3">
                  {files.map((fileInfo, index) => (
                    <div
                      key={fileInfo.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className="border rounded-3 p-3"
                      style={{
                        backgroundColor: draggedIndex === index ? '#e9ecef' : '#fff',
                        cursor: 'grab',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        {/* Order Badge */}
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: '60px' }}>
                          <span className="badge bg-primary fs-12 px-2 py-1">
                            {index + 1}
                          </span>
                          <i className="feather-move text-muted"></i>
                        </div>

                        {/* Preview */}
                        <div 
                          className="border rounded"
                          style={{ 
                            width: '60px', 
                            height: '80px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {previewUrls[fileInfo.id] ? (
                            <iframe
                              src={`${previewUrls[fileInfo.id]}#page=1`}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                pointerEvents: 'none'
                              }}
                              title={`Preview of ${fileInfo.name}`}
                            />
                          ) : (
                            <i className="feather-file-text text-muted" style={{ fontSize: '2rem' }}></i>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-start justify-content-between mb-2">
                            <div>
                              <h6 className="mb-1 text-truncate" style={{ maxWidth: '300px' }}>
                                {fileInfo.name}
                              </h6>
                              <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-soft-info text-info">
                                  {fileInfo.pageCount} page{fileInfo.pageCount > 1 ? 's' : ''}
                                </span>
                                <span className="text-muted fs-11">
                                  {formatFileSize(fileInfo.size)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-light"
                                onClick={() => moveFile(index, -1)}
                                disabled={index === 0}
                                title="Monter"
                              >
                                <i className="feather-arrow-up"></i>
                              </button>
                              <button
                                className="btn btn-light"
                                onClick={() => moveFile(index, 1)}
                                disabled={index === files.length - 1}
                                title="Descendre"
                              >
                                <i className="feather-arrow-down"></i>
                              </button>
                              <button
                                className="btn btn-light text-danger"
                                onClick={() => removeFile(fileInfo.id)}
                                title="Supprimer"
                              >
                                <i className="feather-trash-2"></i>
                              </button>
                            </div>
                          </div>

                          {/* Page Selection */}
                          <div className="mt-2">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <small className="text-muted fw-semibold">
                                Pages sélectionnées: {fileInfo.selectedPages.length}/{fileInfo.pageCount}
                              </small>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-sm btn-light"
                                  onClick={() => selectAllPages(fileInfo.id)}
                                >
                                  Tout
                                </button>
                                <button
                                  className="btn btn-sm btn-light"
                                  onClick={() => deselectAllPages(fileInfo.id)}
                                >
                                  Aucune
                                </button>
                              </div>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-1">
                              {Array.from({ length: fileInfo.pageCount }, (_, i) => i + 1).map(pageNum => (
                                <button
                                  key={pageNum}
                                  className={`btn btn-sm ${
                                    fileInfo.selectedPages.includes(pageNum)
                                      ? 'btn-primary'
                                      : 'btn-outline-secondary'
                                  }`}
                                  onClick={() => togglePageSelection(fileInfo.id, pageNum)}
                                  style={{ 
                                    width: '36px',
                                    height: '36px',
                                    padding: '0',
                                    fontSize: '11px'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Summary */}
        <div className="col-lg-4">
          {/* Summary Card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-info me-2"></i>
                Résumé
              </h6>
              
              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Fichiers PDF:</span>
                  <span className="fw-semibold">{files.length}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Pages totales:</span>
                  <span className="fw-semibold">{totalPages}</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Taille totale:</span>
                  <span className="fw-semibold">
                    {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                  </span>
                </div>
              </div>

              {files.length > 0 && totalPages > 0 && (
                <div className="alert alert-light border mb-0">
                  <small className="text-muted">
                    <i className="feather-check-circle me-1"></i>
                    Prêt à fusionner {files.length} fichier(s) avec {totalPages} page(s)
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-zap me-2"></i>
                Actions
              </h6>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={mergePdfs}
                disabled={isProcessing || files.length < 2 || totalPages === 0}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Fusion en cours... {progress}%
                  </>
                ) : (
                  <>
                    <i className="feather-git-merge me-2"></i>
                    Fusionner les PDF
                  </>
                )}
              </button>

              {isProcessing && (
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}

              <div className="d-flex gap-2 mb-2">
                <button
                  className="btn btn-success flex-fill"
                  onClick={() => setShowSaveModal(true)}
                  disabled={isProcessing || files.length === 0}
                >
                  <i className="feather-save me-2"></i>
                  Sauvegarder
                </button>
                <button
                  className="btn btn-info flex-fill"
                  onClick={() => setShowLoadModal(true)}
                  disabled={isProcessing}
                >
                  <i className="feather-folder-plus me-2"></i>
                  Charger
                </button>
              </div>

              <button
                className="btn btn-light w-100"
                onClick={() => {
                  setFiles([])
                  Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
                  setPreviewUrls({})
                }}
                disabled={isProcessing || files.length === 0}
              >
                <i className="feather-x me-2"></i>
                Tout effacer
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="card border-0 shadow-sm mt-3" style={{ backgroundColor: '#fff9e6' }}>
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-lightbulb me-2 text-warning"></i>
                Conseils
              </h6>
              <ul className="mb-0 ps-3" style={{ fontSize: '13px' }}>
                <li className="mb-2">
                  Glissez-déposez les fichiers pour les réorganiser
                </li>
                <li className="mb-2">
                  Cliquez sur les numéros de page pour sélectionner/désélectionner
                </li>
                <li className="mb-2">
                  Vous pouvez fusionner des pages spécifiques de chaque PDF
                </li>
                <li className="mb-2">
                  Sauvegardez votre projet pour le reprendre plus tard
                </li>
                <li className="mb-0">
                  Le PDF fusionné conserve la qualité originale
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Sauvegarder */}
      {showSaveModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-save me-2"></i>
                  Sauvegarder le projet
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom du projet *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mon projet de fusion"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Description du projet..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    disabled={isSaving}
                  ></textarea>
                </div>
                <div className="alert alert-light border mb-0">
                  <small className="text-muted">
                    <strong>{files.length}</strong> fichier(s) avec <strong>{totalPages}</strong> page(s) seront sauvegardés
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveProject}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <i className="feather-save me-2"></i>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Charger */}
      {showLoadModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-folder-plus me-2"></i>
                  Charger un projet
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLoadModal(false)}
                  disabled={isLoading}
                ></button>
              </div>
              <div className="modal-body">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="feather-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                    <p className="text-muted mt-3 mb-0">Aucun projet sauvegardé</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {savedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1" style={{ cursor: 'pointer' }} onClick={() => handleLoadProject(project.id)}>
                            <h6 className="mb-1">{project.name}</h6>
                            {project.description && (
                              <p className="mb-2 text-muted fs-12">{project.description}</p>
                            )}
                            <div className="d-flex gap-3 mt-2">
                              <span className="badge bg-soft-primary text-primary">
                                {project.totalFiles} fichier(s)
                              </span>
                              <span className="badge bg-soft-info text-info">
                                {project.totalPages} page(s)
                              </span>
                              <span className="text-muted fs-11">
                                {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-light text-danger ms-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProject(project.id)
                            }}
                            disabled={isLoading}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowLoadModal(false)}
                  disabled={isLoading}
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
