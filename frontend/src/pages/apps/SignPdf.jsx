import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import toast from 'react-hot-toast'

export default function SignPdf() {
  const [file, setFile] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [signatureImage, setSignatureImage] = useState(null)
  const [signatureMode, setSignatureMode] = useState('draw') // draw, type, image
  const [signatureText, setSignatureText] = useState('')
  const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 })
  const [signatureSize, setSignatureSize] = useState({ width: 200, height: 80 })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const drawCanvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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
      const pages = pdf.getPageCount()

      setFile(selectedFile)
      setPdfDoc(pdf)
      setTotalPages(pages)
      setCurrentPage(0)

      // Create preview
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      toast.success(`PDF chargé: ${pages} page(s)`)
    } catch (error) {
      console.error('Erreur chargement PDF:', error)
      toast.error('Erreur lors du chargement du PDF')
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setSignatureImage(e.target.result)
      toast.success('Image chargée')
    }
    reader.readAsDataURL(file)
  }

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = drawCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = drawCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    // Convert canvas to image
    const canvas = drawCanvasRef.current
    setSignatureImage(canvas.toDataURL())
  }

  const signPdf = async () => {
    if (!pdfDoc) {
      toast.error('Aucun PDF chargé')
      return
    }

    if (!signatureImage && !signatureText) {
      toast.error('Veuillez créer une signature')
      return
    }

    setIsProcessing(true)

    try {
      const pdfDocCopy = await PDFDocument.load(await pdfDoc.save())
      const pages = pdfDocCopy.getPages()
      const page = pages[currentPage]
      const { width, height } = page.getSize()

      if (signatureMode === 'type' && signatureText) {
        // Add text signature
        const font = await pdfDocCopy.embedFont(StandardFonts.HelveticaBoldOblique)
        const fontSize = 24
        page.drawText(signatureText, {
          x: signaturePosition.x,
          y: height - signaturePosition.y - fontSize,
          size: fontSize,
          font,
          color: rgb(0, 0, 0.5)
        })
      } else if (signatureImage) {
        // Add image signature
        const imageBytes = await fetch(signatureImage).then(r => r.arrayBuffer())
        let image
        
        if (signatureImage.startsWith('data:image/png')) {
          image = await pdfDocCopy.embedPng(imageBytes)
        } else {
          image = await pdfDocCopy.embedJpg(imageBytes)
        }

        page.drawImage(image, {
          x: signaturePosition.x,
          y: height - signaturePosition.y - signatureSize.height,
          width: signatureSize.width,
          height: signatureSize.height
        })
      }

      const pdfBytes = await pdfDocCopy.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      
      // Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf', '-signed.pdf')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('PDF signé avec succès !')
    } catch (error) {
      console.error('Erreur signature:', error)
      toast.error('Erreur lors de la signature du PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <span className="avatar-text avatar-md rounded-3 bg-soft-secondary text-primary">
              <i className="feather-edit"></i>
            </span>
            <span>Signer PDF</span>
          </h4>
          <p className="text-muted mb-0">
            Signez vos documents PDF avec une signature électronique
          </p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Tous les outils
        </Link>
      </div>

      <div className="row g-3">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Upload Card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-upload me-2"></i>
                Charger le PDF
              </h6>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="form-control"
              />
            </div>
          </div>

          {/* PDF Preview */}
          {file && previewUrl && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0">
                    <i className="feather-file-text me-2"></i>
                    Aperçu (Page {currentPage + 1}/{totalPages})
                  </h6>
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-light"
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                    >
                      <i className="feather-chevron-left"></i>
                    </button>
                    <button
                      className="btn btn-light"
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      <i className="feather-chevron-right"></i>
                    </button>
                  </div>
                </div>
                <div className="border rounded" style={{ height: '500px', overflow: 'auto' }}>
                  <iframe
                    src={`${previewUrl}#page=${currentPage + 1}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Preview"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Signature Creator */}
          {file && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-pen-tool me-2"></i>
                  Créer la signature
                </h6>

                {/* Mode Selection */}
                <div className="btn-group w-100 mb-3" role="group">
                  <button
                    className={`btn ${signatureMode === 'draw' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSignatureMode('draw')}
                  >
                    <i className="feather-edit-2 me-2"></i>
                    Dessiner
                  </button>
                  <button
                    className={`btn ${signatureMode === 'type' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSignatureMode('type')}
                  >
                    <i className="feather-type me-2"></i>
                    Taper
                  </button>
                  <button
                    className={`btn ${signatureMode === 'image' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSignatureMode('image')}
                  >
                    <i className="feather-image me-2"></i>
                    Image
                  </button>
                </div>

                {/* Draw Mode */}
                {signatureMode === 'draw' && (
                  <div>
                    <div className="border rounded mb-2" style={{ backgroundColor: '#fff' }}>
                      <canvas
                        ref={drawCanvasRef}
                        width={600}
                        height={200}
                        style={{ width: '100%', cursor: 'crosshair' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <button className="btn btn-sm btn-light" onClick={clearDrawing}>
                      <i className="feather-x me-2"></i>
                      Effacer
                    </button>
                  </div>
                )}

                {/* Type Mode */}
                {signatureMode === 'type' && (
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Votre signature..."
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      style={{ fontFamily: 'cursive', fontSize: '24px' }}
                    />
                    {signatureText && (
                      <div className="mt-3 p-3 border rounded text-center" style={{ fontFamily: 'cursive', fontSize: '32px', color: '#0066cc' }}>
                        {signatureText}
                      </div>
                    )}
                  </div>
                )}

                {/* Image Mode */}
                {signatureMode === 'image' && (
                  <div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="form-control mb-2"
                    />
                    {signatureImage && (
                      <img src={signatureImage} alt="Signature" className="img-fluid border rounded" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Position Settings */}
          {file && (signatureImage || signatureText) && (
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-move me-2"></i>
                  Position & Taille
                </h6>
                
                <div className="mb-3">
                  <label className="form-label">Position X</label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="500"
                    value={signaturePosition.x}
                    onChange={(e) => setSignaturePosition(prev => ({ ...prev, x: Number(e.target.value) }))}
                  />
                  <small className="text-muted">{signaturePosition.x}px</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Position Y</label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="700"
                    value={signaturePosition.y}
                    onChange={(e) => setSignaturePosition(prev => ({ ...prev, y: Number(e.target.value) }))}
                  />
                  <small className="text-muted">{signaturePosition.y}px</small>
                </div>

                {signatureMode !== 'type' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Largeur</label>
                      <input
                        type="range"
                        className="form-range"
                        min="50"
                        max="400"
                        value={signatureSize.width}
                        onChange={(e) => setSignatureSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                      />
                      <small className="text-muted">{signatureSize.width}px</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Hauteur</label>
                      <input
                        type="range"
                        className="form-range"
                        min="30"
                        max="200"
                        value={signatureSize.height}
                        onChange={(e) => setSignatureSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                      />
                      <small className="text-muted">{signatureSize.height}px</small>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-check me-2"></i>
                Action
              </h6>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={signPdf}
                disabled={isProcessing || !file || (!signatureImage && !signatureText)}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signature en cours...
                  </>
                ) : (
                  <>
                    <i className="feather-check-circle me-2"></i>
                    Signer le PDF
                  </>
                )}
              </button>

              {!file && (
                <div className="alert alert-info mb-0">
                  <small>
                    <i className="feather-info me-2"></i>
                    Chargez un PDF pour commencer
                  </small>
                </div>
              )}
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
                  Dessinez votre signature ou tapez votre nom
                </li>
                <li className="mb-2">
                  Ajustez la position avec les curseurs
                </li>
                <li className="mb-2">
                  Vous pouvez importer une image de signature
                </li>
                <li className="mb-0">
                  La signature sera appliquée sur la page actuelle
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
