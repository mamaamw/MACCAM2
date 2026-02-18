import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import toast from 'react-hot-toast'

export default function EditPdf() {
  const [file, setFile] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Mode toggle: 'navigation' or 'annotation'
  const [mode, setMode] = useState('navigation')
  
  // Edit tools state
  const [editTool, setEditTool] = useState('text') // 'text', 'draw', 'rectangle', 'highlight'
  const [textInput, setTextInput] = useState('')
  const [fontSize, setFontSize] = useState(12)
  const [textColor, setTextColor] = useState('#000000')
  const [drawColor, setDrawColor] = useState('#ff0000')
  const [lineWidth, setLineWidth] = useState(2)
  const [highlightColor, setHighlightColor] = useState('#ffff00')
  const [highlightOpacity, setHighlightOpacity] = useState(0.3)
  const [highlightWidth, setHighlightWidth] = useState(20)
  
  // Annotations storage
  const [annotations, setAnnotations] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState([])
  const [rectangleStart, setRectangleStart] = useState(null)
  
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const pdfContainerRef = useRef(null)

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés')
      return
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      
      setPdfDoc(pdf)
      setFile(selectedFile)
      setTotalPages(pdf.getPageCount())
      setAnnotations([])
      
      // Create preview URL
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      
      toast.success('PDF chargé avec succès')
    } catch (error) {
      console.error('Erreur chargement PDF:', error)
      toast.error('Erreur lors du chargement du PDF')
    }
  }

  const handleCanvasMouseDown = (e) => {
    if (editTool !== 'text') {
      setIsDrawing(true)
      const rect = canvasRef.current.getBoundingClientRect()
      const scrollTop = pdfContainerRef.current?.scrollTop || 0
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top + scrollTop
      
      if (editTool === 'rectangle') {
        setRectangleStart({ x, y })
      } else {
        setCurrentPath([{ x, y }])
      }
    }
  }

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || editTool === 'text') return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const scrollTop = pdfContainerRef.current?.scrollTop || 0
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top + scrollTop
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (editTool === 'rectangle' && rectangleStart) {
      // Clear canvas and redraw all existing annotations
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Redraw existing annotations
      annotations.forEach(annotation => {
        if (annotation.type === 'draw' && annotation.path) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          annotation.path.forEach((point, i) => {
            const adjustedY = point.y - scrollTop
            if (i === 0) ctx.moveTo(point.x, adjustedY)
            else ctx.lineTo(point.x, adjustedY)
          })
          ctx.stroke()
        } else if (annotation.type === 'rectangle' && annotation.startX !== undefined) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth
          ctx.strokeRect(
            annotation.startX,
            annotation.startY - scrollTop,
            annotation.width,
            annotation.height
          )
        } else if (annotation.type === 'highlight' && annotation.path) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth || 20
          ctx.lineCap = 'square'
          ctx.lineJoin = 'miter'
          ctx.globalAlpha = annotation.opacity || 0.3
          ctx.beginPath()
          annotation.path.forEach((point, i) => {
            const adjustedY = point.y - scrollTop
            if (i === 0) ctx.moveTo(point.x, adjustedY)
            else ctx.lineTo(point.x, adjustedY)
          })
          ctx.stroke()
          ctx.globalAlpha = 1.0
        } else if (annotation.type === 'text' && annotation.text) {
          ctx.fillStyle = annotation.color
          ctx.font = `${annotation.fontSize}px Arial`
          ctx.fillText(annotation.text, annotation.x, annotation.y - scrollTop)
        }
      })
      
      // Draw current rectangle preview
      ctx.strokeStyle = drawColor
      ctx.lineWidth = lineWidth
      const width = x - rectangleStart.x
      const height = y - rectangleStart.y
      ctx.strokeRect(rectangleStart.x, rectangleStart.y - scrollTop, width, height)
    } else {
      // Free draw mode (draw and highlight)
      setCurrentPath(prev => [...prev, { x, y }])
      
      if (editTool === 'highlight') {
        ctx.strokeStyle = highlightColor
        ctx.lineWidth = highlightWidth
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.globalAlpha = highlightOpacity
      } else {
        ctx.strokeStyle = drawColor
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 1.0
      }
      
      if (currentPath.length > 0) {
        const prevPoint = currentPath[currentPath.length - 1]
        ctx.beginPath()
        ctx.moveTo(prevPoint.x, prevPoint.y - scrollTop)
        ctx.lineTo(x, y - scrollTop)
        ctx.stroke()
      }
      
      ctx.globalAlpha = 1.0
    }
  }

  const handleCanvasMouseUp = (e) => {
    if (isDrawing) {
      if (editTool === 'rectangle' && rectangleStart) {
        const rect = canvasRef.current.getBoundingClientRect()
        const scrollTop = pdfContainerRef.current?.scrollTop || 0
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top + scrollTop
        
        // Save rectangle annotation
        const newAnnotation = {
          type: 'rectangle',
          startX: rectangleStart.x,
          startY: rectangleStart.y,
          width: x - rectangleStart.x,
          height: y - rectangleStart.y,
          color: drawColor,
          lineWidth: lineWidth,
          id: Date.now()
        }
        setAnnotations(prev => [...prev, newAnnotation])
        setRectangleStart(null)
      } else if (currentPath.length > 0) {
        // Save free draw or highlight annotation
        const newAnnotation = editTool === 'highlight' ? {
          type: 'highlight',
          path: currentPath,
          color: highlightColor,
          lineWidth: highlightWidth,
          opacity: highlightOpacity,
          id: Date.now()
        } : {
          type: 'draw',
          path: currentPath,
          color: drawColor,
          lineWidth: lineWidth,
          id: Date.now()
        }
        setAnnotations(prev => [...prev, newAnnotation])
      }
    }
    setIsDrawing(false)
    setCurrentPath([])
  }

  const handleCanvasClick = (e) => {
    if (editTool === 'text' && textInput.trim()) {
      const rect = canvasRef.current.getBoundingClientRect()
      const scrollTop = pdfContainerRef.current?.scrollTop || 0
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top + scrollTop
      
      const newAnnotation = {
        type: 'text',
        x,
        y,
        text: textInput,
        fontSize,
        color: textColor,
        id: Date.now()
      }
      
      setAnnotations(prev => [...prev, newAnnotation])
      toast.success('Texte ajouté')
    }
  }

  const clearAnnotations = () => {
    setAnnotations([])
    setRectangleStart(null)
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    toast.success('Annotations effacées')
  }

  const undoLastAnnotation = () => {
    if (annotations.length > 0) {
      setAnnotations(prev => prev.slice(0, -1))
      toast.success('Dernière annotation annulée')
    }
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 }
  }

  const savePdf = async () => {
    if (!pdfDoc) {
      toast.error('Aucun PDF chargé')
      return
    }

    if (annotations.length === 0) {
      toast.error('Aucune modification à enregistrer')
      return
    }

    setIsProcessing(true)

    try {
      // Create a copy of the PDF
      const pdfCopy = await PDFDocument.create()
      const copiedPages = await pdfCopy.copyPages(pdfDoc, pdfDoc.getPageIndices())
      copiedPages.forEach(page => pdfCopy.addPage(page))

      const font = await pdfCopy.embedFont(StandardFonts.Helvetica)

      // Estimate page height in viewport (approximately 1100px per page based on iframe height)
      const estimatedPageHeight = 1100
      
      // Apply annotations to their respective pages
      for (const annotation of annotations) {
        // Calculate which page this annotation belongs to
        const pageIndex = Math.floor(annotation.y / estimatedPageHeight)
        const yOnPage = annotation.y % estimatedPageHeight
        
        if (pageIndex < pdfCopy.getPageCount()) {
          const page = pdfCopy.getPage(pageIndex)
          const { width, height } = page.getSize()
          const scaleFactor = height / estimatedPageHeight
          
          if (annotation.type === 'text') {
            const color = hexToRgb(annotation.color)
            page.drawText(annotation.text, {
              x: annotation.x,
              y: height - (yOnPage * scaleFactor),
              size: annotation.fontSize,
              font: font,
              color: rgb(color.r, color.g, color.b)
            })
          } else if (annotation.type === 'draw') {
            const color = hexToRgb(annotation.color)
            if (annotation.path && annotation.path.length > 1) {
              for (let j = 0; j < annotation.path.length - 1; j++) {
                const start = annotation.path[j]
                const end = annotation.path[j + 1]
                
                // Check if both points are on this page
                const startPageIndex = Math.floor(start.y / estimatedPageHeight)
                const endPageIndex = Math.floor(end.y / estimatedPageHeight)
                
                if (startPageIndex === pageIndex && endPageIndex === pageIndex) {
                  const startYOnPage = start.y % estimatedPageHeight
                  const endYOnPage = end.y % estimatedPageHeight
                  
                  page.drawLine({
                    start: { x: start.x, y: height - (startYOnPage * scaleFactor) },
                    end: { x: end.x, y: height - (endYOnPage * scaleFactor) },
                    thickness: annotation.lineWidth,
                    color: rgb(color.r, color.g, color.b)
                  })
                }
              }
            }
          } else if (annotation.type === 'rectangle' && annotation.startX !== undefined) {
            const color = hexToRgb(annotation.color)
            const rectWidth = Math.abs(annotation.width)
            const rectHeight = Math.abs(annotation.height) * scaleFactor
            const startX = annotation.width >= 0 ? annotation.startX : annotation.startX + annotation.width
            const startY = annotation.height >= 0 ? annotation.startY : annotation.startY + annotation.height
            
            const startYOnPage = startY % estimatedPageHeight
            
            page.drawRectangle({
              x: startX,
              y: height - (startYOnPage * scaleFactor) - rectHeight,
              width: rectWidth,
              height: rectHeight,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: annotation.lineWidth
            })
          } else if (annotation.type === 'highlight') {
            const color = hexToRgb(annotation.color)
            if (annotation.path && annotation.path.length > 1) {
              for (let j = 0; j < annotation.path.length - 1; j++) {
                const start = annotation.path[j]
                const end = annotation.path[j + 1]
                
                // Check if both points are on this page
                const startPageIndex = Math.floor(start.y / estimatedPageHeight)
                const endPageIndex = Math.floor(end.y / estimatedPageHeight)
                
                if (startPageIndex === pageIndex && endPageIndex === pageIndex) {
                  const startYOnPage = start.y % estimatedPageHeight
                  const endYOnPage = end.y % estimatedPageHeight
                  
                  page.drawLine({
                    start: { x: start.x, y: height - (startYOnPage * scaleFactor) },
                    end: { x: end.x, y: height - (endYOnPage * scaleFactor) },
                    thickness: annotation.lineWidth || 20,
                    color: rgb(color.r, color.g, color.b),
                    opacity: annotation.opacity || 0.3
                  })
                }
              }
            }
          }
        }
      }

      const pdfBytes = await pdfCopy.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf', '-edited.pdf')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('PDF édité téléchargé avec succès !')
    } catch (error) {
      console.error('Erreur sauvegarde PDF:', error)
      toast.error('Erreur lors de la sauvegarde du PDF')
    } finally {
      setIsProcessing(false)
    }
  }



  // Setup canvas overlay and redraw annotations when page changes
  useEffect(() => {
    if (canvasRef.current && pdfContainerRef.current) {
      const container = pdfContainerRef.current
      const canvas = canvasRef.current
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
      
      const scrollTop = container.scrollTop || 0
      
      // Redraw all annotations
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      annotations.forEach(annotation => {
        if (annotation.type === 'draw' && annotation.path) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          annotation.path.forEach((point, i) => {
            const adjustedY = point.y - scrollTop
            if (i === 0) ctx.moveTo(point.x, adjustedY)
            else ctx.lineTo(point.x, adjustedY)
          })
          ctx.stroke()
        } else if (annotation.type === 'rectangle' && annotation.startX !== undefined) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth
          ctx.strokeRect(
            annotation.startX,
            annotation.startY - scrollTop,
            annotation.width,
            annotation.height
          )
        } else if (annotation.type === 'highlight' && annotation.path) {
          ctx.strokeStyle = annotation.color
          ctx.lineWidth = annotation.lineWidth || 20
          ctx.lineCap = 'square'
          ctx.lineJoin = 'miter'
          ctx.globalAlpha = annotation.opacity || 0.3
          ctx.beginPath()
          annotation.path.forEach((point, i) => {
            const adjustedY = point.y - scrollTop
            if (i === 0) ctx.moveTo(point.x, adjustedY)
            else ctx.lineTo(point.x, adjustedY)
          })
          ctx.stroke()
          ctx.globalAlpha = 1.0
        } else if (annotation.type === 'text' && annotation.text) {
          ctx.fillStyle = annotation.color
          ctx.font = `${annotation.fontSize}px Arial`
          ctx.fillText(annotation.text, annotation.x, annotation.y - scrollTop)
        }
      })
    }
  }, [previewUrl, annotations])
  useEffect(() => {
    const container = pdfContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const scrollTop = container.scrollTop || 0
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        annotations.forEach(annotation => {
          if (annotation.type === 'draw' && annotation.path) {
            ctx.strokeStyle = annotation.color
            ctx.lineWidth = annotation.lineWidth
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.beginPath()
            annotation.path.forEach((point, i) => {
              const adjustedY = point.y - scrollTop
              if (i === 0) ctx.moveTo(point.x, adjustedY)
              else ctx.lineTo(point.x, adjustedY)
            })
            ctx.stroke()
          } else if (annotation.type === 'rectangle' && annotation.startX !== undefined) {
            ctx.strokeStyle = annotation.color
            ctx.lineWidth = annotation.lineWidth
            ctx.strokeRect(
              annotation.startX,
              annotation.startY - scrollTop,
              annotation.width,
              annotation.height
            )
          } else if (annotation.type === 'highlight' && annotation.path) {
            ctx.strokeStyle = annotation.color
            ctx.lineWidth = annotation.lineWidth || 20
            ctx.lineCap = 'square'
            ctx.lineJoin = 'miter'
            ctx.globalAlpha = annotation.opacity || 0.3
            ctx.beginPath()
            annotation.path.forEach((point, i) => {
              const adjustedY = point.y - scrollTop
              if (i === 0) ctx.moveTo(point.x, adjustedY)
              else ctx.lineTo(point.x, adjustedY)
            })
            ctx.stroke()
            ctx.globalAlpha = 1.0
          } else if (annotation.type === 'text' && annotation.text) {
            ctx.fillStyle = annotation.color
            ctx.font = `${annotation.fontSize}px Arial`
            ctx.fillText(annotation.text, annotation.x, annotation.y - scrollTop)
          }
        })
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [annotations])

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <span className="avatar-text avatar-md rounded-3 bg-soft-secondary text-primary">
              <i className="feather-file-text"></i>
            </span>
            <span>Visualiser PDF</span>
          </h4>
          <p className="text-muted mb-0">
            Consultez vos documents PDF avec tous les contrôles natifs du viewer
          </p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Tous les outils
        </Link>
      </div>

      <div className="row">
        {/* Left Column - PDF Preview & Tools */}
        <div className="col-lg-8">
          {!file ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div 
                  className="border-2 border-dashed rounded-3 p-5 text-center"
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="feather-file-plus" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <h4 className="mt-4 mb-2">Glissez-déposez votre PDF ici</h4>
                  <p className="text-muted mb-4">ou cliquez pour parcourir</p>
                  <button className="btn btn-primary btn-lg">
                    <i className="feather-folder me-2"></i>
                    Choisir un fichier PDF
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* PDF Preview with Canvas Overlay */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-0">
                  <div 
                    ref={pdfContainerRef}
                    style={{ 
                      position: 'relative',
                      width: '100%',
                      minHeight: '800px'
                    }}
                  >
                    <iframe
                      src={previewUrl}
                      style={{
                        width: '100%',
                        height: '800px',
                        border: 'none',
                        display: 'block'
                      }}
                      title="PDF Preview"
                    />
                    <canvas
                      ref={canvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '800px',
                        cursor: mode === 'annotation' ? (editTool === 'text' ? 'text' : 'crosshair') : 'default',
                        pointerEvents: mode === 'annotation' ? 'auto' : 'none',
                        zIndex: mode === 'annotation' ? 10 : -1
                      }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      onClick={handleCanvasClick}
                    />
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-1">
                        <i className="feather-layers me-2"></i>
                        Mode actuel
                      </h6>
                      <small className="text-muted">
                        {mode === 'navigation' ? 'Contrôles PDF actifs' : 'Outils d\'annotation actifs'}
                      </small>
                    </div>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn ${mode === 'navigation' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setMode('navigation')}
                      >
                        <i className="feather-mouse-pointer me-2"></i>
                        Navigation
                      </button>
                      <button
                        type="button"
                        className={`btn ${mode === 'annotation' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setMode('annotation')}
                      >
                        <i className="feather-edit-3 me-2"></i>
                        Annotation
                      </button>
                    </div>
                  </div>
                  {mode === 'navigation' && (
                    <div className="alert alert-info mt-3 mb-0" style={{ fontSize: '12px' }}>
                      <i className="feather-info me-1"></i>
                      Utilisez les contrôles natifs du viewer PDF (pages, zoom, recherche, etc.)
                    </div>
                  )}
                  {mode === 'annotation' && (
                    <div className="alert alert-warning mt-3 mb-0" style={{ fontSize: '12px' }}>
                      <i className="feather-alert-triangle me-1"></i>
                      Les contrôles PDF sont désactivés. Sélectionnez un outil et cliquez sur le document pour annoter.
                    </div>
                  )}
                </div>
              </div>

              {/* Document Info */}
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Document</small>
                      <h6 className="mb-0">{file.name}</h6>
                    </div>
                    <span className="badge bg-primary" style={{ fontSize: '14px' }}>
                      {totalPages} page{totalPages > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="feather-info me-1"></i>
                      Faites défiler pour voir toutes les pages
                    </small>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Info & Actions */}
        <div className="col-lg-4">
          {/* Document Info */}
          {file && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-file-text me-2"></i>
                  Informations du document
                </h6>
                
                <div className="mb-3">
                  <small className="text-muted">Nom du fichier</small>
                  <p className="mb-0 fw-semibold">{file.name}</p>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">Nombre de pages</small>
                  <p className="mb-0 fw-semibold">{totalPages}</p>
                </div>
                
                <div className="mb-0">
                  <small className="text-muted">Taille</small>
                  <p className="mb-0 fw-semibold">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          {file && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-download me-2"></i>
                  Actions
                </h6>
                
                <div className="d-grid gap-2">
                  <a
                    href={previewUrl}
                    download={file.name}
                    className="btn btn-primary"
                  >
                    <i className="feather-download me-2"></i>
                    Télécharger le PDF
                  </a>
                  
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.open(previewUrl, '_blank')}
                  >
                    <i className="feather-external-link me-2"></i>
                    Ouvrir dans un nouvel onglet
                  </button>
                  
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                      setFile(null)
                      setPdfDoc(null)
                      setPreviewUrl('')
                      setTotalPages(0)
                      setAnnotations([])
                      setMode('navigation')
                    }}
                  >
                    <i className="feather-x me-2"></i>
                    Fermer le document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tool Selection */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-tool me-2"></i>
                Outils d'édition
              </h6>
              
              <div className="d-grid gap-2">
                <button
                  className={`btn ${editTool === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setEditTool('text')}
                  disabled={!file || mode === 'navigation'}
                >
                  <i className="feather-type me-2"></i>
                  Texte
                </button>
                <button
                  className={`btn ${editTool === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setEditTool('draw')}
                  disabled={!file || mode === 'navigation'}
                >
                  <i className="feather-pen-tool me-2"></i>
                  Dessin libre
                </button>
                <button
                  className={`btn ${editTool === 'rectangle' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setEditTool('rectangle')}
                  disabled={!file || mode === 'navigation'}
                >
                  <i className="feather-square me-2"></i>
                  Rectangle
                </button>
                <button
                  className={`btn ${editTool === 'highlight' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setEditTool('highlight')}
                  disabled={!file || mode === 'navigation'}
                >
                  <i className="feather-minus me-2"></i>
                  Surligneur
                </button>
              </div>
              
              {mode === 'navigation' && (
                <div className="alert alert-info mt-3 mb-0" style={{ fontSize: '12px' }}>
                  <i className="feather-info me-1"></i>
                  Passez en mode Annotation pour utiliser ces outils
                </div>
              )}
            </div>
          </div>

          {/* Text Tool Settings */}
          {editTool === 'text' && file && mode === 'annotation' && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">Paramètres du texte</h6>
                
                <div className="mb-3">
                  <label className="form-label">Texte</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrez votre texte..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Taille: {fontSize}px</label>
                  <input
                    type="range"
                    className="form-range"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">Couleur</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Draw Tool Settings */}
          {(editTool === 'draw' || editTool === 'rectangle') && file && mode === 'annotation' && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">Paramètres du dessin</h6>
                
                <div className="mb-3">
                  <label className="form-label">Épaisseur: {lineWidth}px</label>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">Couleur</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Highlight Tool Settings */}
          {editTool === 'highlight' && file && mode === 'annotation' && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">Paramètres du surligneur</h6>
                
                <div className="mb-3">
                  <label className="form-label">Épaisseur: {highlightWidth}px</label>
                  <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="40"
                    value={highlightWidth}
                    onChange={(e) => setHighlightWidth(Number(e.target.value))}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Opacité: {Math.round(highlightOpacity * 100)}%</label>
                  <input
                    type="range"
                    className="form-range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={highlightOpacity}
                    onChange={(e) => setHighlightOpacity(Number(e.target.value))}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">Couleur</label>
                  <input
                    type="color"
                    className="form-control form-control-color w-100"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Annotations Info */}
          {file && mode === 'annotation' && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-layers me-2"></i>
                  Annotations
                </h6>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total:</span>
                  <span className="badge bg-info">{annotations.length}</span>
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={undoLastAnnotation}
                    disabled={annotations.length === 0}
                  >
                    <i className="feather-corner-up-left me-2"></i>
                    Annuler la dernière
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearAnnotations}
                    disabled={annotations.length === 0}
                  >
                    <i className="feather-trash-2 me-2"></i>
                    Effacer tout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {file && mode === 'annotation' && annotations.length > 0 && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <button
                  className="btn btn-success w-100"
                  onClick={savePdf}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <i className="feather-download me-2"></i>
                      Télécharger le PDF édité
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card border-0 shadow-sm" style={{ backgroundColor: mode === 'navigation' ? '#e3f2fd' : '#fff9e6' }}>
            <div className="card-body">
              <h6 className="mb-3">
                <i className={`feather-info me-2 ${mode === 'navigation' ? 'text-primary' : 'text-warning'}`}></i>
                {mode === 'navigation' ? 'Mode Navigation' : 'Mode Annotation'}
              </h6>
              {mode === 'navigation' ? (
                <ul className="mb-0 ps-3" style={{ fontSize: '13px' }}>
                  <li className="mb-2">Utilisez tous les contrôles du viewer PDF (zoom, vignettes)</li>
                  <li className="mb-2">Naviguez entre les pages avec le sélecteur</li>
                  <li className="mb-2">Recherchez du texte dans le document</li>
                  <li className="mb-0">Cliquez sur "Annotation" pour dessiner ou ajouter du texte</li>
                </ul>
              ) : (
                <ul className="mb-0 ps-3" style={{ fontSize: '13px' }}>
                  <li className="mb-2">Sélectionnez un outil (Texte, Dessin, Rectangle)</li>
                  <li className="mb-2">Cliquez sur le document pour annoter</li>
                  <li className="mb-2">Ajustez les paramètres (couleur, taille)</li>
                  <li className="mb-0">Téléchargez le PDF avec vos annotations</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
