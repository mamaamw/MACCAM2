import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import toast from 'react-hot-toast'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function SignPdf() {
  const [file, setFile] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pdfJsDoc, setPdfJsDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Individual elements
  const [signatureText, setSignatureText] = useState('')
  const [textColor, setTextColor] = useState('#000080')
  const [fontSize, setFontSize] = useState(32)
  
  const [signatureImage, setSignatureImage] = useState(null)
  const [imageNaturalSize, setImageNaturalSize] = useState(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  
  // Placed elements on PDF
  const [placedElements, setPlacedElements] = useState([]) // [{type, data, position: {x,y,width,height,page}}]
  const [placementMode, setPlacementMode] = useState(null) // 'text', 'image', or 'drawing'
  const [pendingElement, setPendingElement] = useState(null) // Element being placed
  const [previewPosition, setPreviewPosition] = useState(null) // {x, y} for preview
  
  // Digital signature
  const [digitalSignMethod, setDigitalSignMethod] = useState('certificate') // 'certificate', 'eid', 'itsme', 'csam'
  const [certificate, setCertificate] = useState(null)
  const [certificatePassword, setCertificatePassword] = useState('')
  const [signatureReason, setSignatureReason] = useState('Signature électronique')
  const [signerName, setSignerName] = useState('')
  const [signatureStampPosition, setSignatureStampPosition] = useState(null) // {x, y, page}
  
  // eID specific
  const [eidPin, setEidPin] = useState('')
  const [eidCardInfo, setEidCardInfo] = useState(null)
  
  // OAuth specific (itsme & CSAM)
  const [authCode, setAuthCode] = useState(null)
  const [availableMethods, setAvailableMethods] = useState([])
  
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const drawCanvasRef = useRef(null)
  const pdfCanvasRef = useRef(null)
  const savedCanvasRef = useRef(null) // Sauvegarde du canvas pour overlay rapide
  const currentScaleRef = useRef(1) // Scale actuel du PDF
  const viewportDimensionsRef = useRef(new Map()) // Dimensions de viewport pour chaque page
  const renderingTaskRef = useRef(null) // Track ongoing render task

  // Initialize drawing canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  // Render PDF when page changes or elements are placed
  useEffect(() => {
    if (pdfJsDoc && pdfCanvasRef.current) {
      renderPdfPage(currentPage)
    }
  }, [pdfJsDoc, currentPage, placedElements])

  // Load available signature methods
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/pdf-sign/methods')
      .then(res => res.json())
      .then(data => setAvailableMethods(data.methods))
      .catch(err => console.error('Erreur chargement méthodes:', err))
  }, [])

  // Handle OAuth callback (itsme, CSAM)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('authCode')
    const method = urlParams.get('method')
    const error = urlParams.get('error')
    
    if (error) {
      toast.error(`Erreur d'authentification: ${error}`)
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (code && method) {
      setAuthCode(code)
      setDigitalSignMethod(method)
      toast.success('Authentification réussie ! Vous pouvez maintenant signer le document.')
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptÃ©s')
      return
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfJsDocument = await loadingTask.promise

      setFile(selectedFile)
      setPdfDoc(pdf)
      setPdfJsDoc(pdfJsDocument)
      setTotalPages(pageCount)
      setCurrentPage(0)
      setPlacedElements([])
      setPlacementMode(null)

      toast.success(`PDF chargÃ©: ${pageCount} page(s)`)
    } catch (error) {
      console.error('Erreur chargement PDF:', error)
      toast.error('Erreur lors du chargement du PDF')
    }
  }

  const renderPdfPage = async (pageIndex) => {
    if (!pdfJsDoc || !pdfCanvasRef.current) return
    
    // Cancel previous render if still ongoing
    if (renderingTaskRef.current) {
      renderingTaskRef.current.cancel()
      renderingTaskRef.current = null
    }
    
    try {
      const page = await pdfJsDoc.getPage(pageIndex + 1)
      const canvas = pdfCanvasRef.current
      const ctx = canvas.getContext('2d')
      
      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = canvas.parentElement?.offsetWidth || 800
      const scale = Math.min(containerWidth / viewport.width, 1.5)
      const scaledViewport = page.getViewport({ scale })
      
      // Save scale and viewport dimensions for coordinate conversion
      // Note: viewport dimensions are AFTER rotation, but we need them for canvas to PDF conversion
      currentScaleRef.current = scale
      viewportDimensionsRef.current.set(pageIndex, {
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        rotation: viewport.rotation,
        scale: scale
      })
      
      // Only resize canvas if dimensions changed
      if (canvas.width !== scaledViewport.width || canvas.height !== scaledViewport.height) {
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
      }
      
      renderingTaskRef.current = page.render({ canvasContext: ctx, viewport: scaledViewport })
      await renderingTaskRef.current.promise
      renderingTaskRef.current = null
      
      // Save canvas state for quick preview overlay
      savedCanvasRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
      
      // Draw all placed elements on this page
      placedElements.filter(el => el.position.page === pageIndex).forEach(element => {
        if (element.type === 'text') {
          ctx.font = `italic ${element.data.fontSize * scale}px cursive`
          ctx.fillStyle = element.data.color
          ctx.fillText(
            element.data.text,
            element.position.x * scale,
            element.position.y * scale
          )
        } else if (element.type === 'image') {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(
              img,
              element.position.x * scale,
              element.position.y * scale,
              element.position.width * scale,
              element.position.height * scale
            )
          }
          img.src = element.data
        } else if (element.type === 'drawing') {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(
              img,
              element.position.x * scale,
              element.position.y * scale,
              element.position.width * scale,
              element.position.height * scale
            )
          }
          img.src = element.data
        }
      })
    } catch (error) {
      console.error('Erreur rendu page:', error)
    }
  }

  const drawPreviewOverlay = () => {
    if (!placementMode || !pendingElement || !previewPosition || !pdfCanvasRef.current) return
    
    const canvas = pdfCanvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Restore saved canvas state instead of re-rendering PDF
    if (savedCanvasRef.current) {
      ctx.putImageData(savedCanvasRef.current, 0, 0)
    }
    
    // Redraw placed elements on this page
    const scale = currentScaleRef.current
    placedElements.filter(el => el.position.page === currentPage).forEach(element => {
      if (element.type === 'text') {
        ctx.font = `italic ${element.data.fontSize * scale}px cursive`
        ctx.fillStyle = element.data.color
        ctx.fillText(
          element.data.text,
          element.position.x * scale,
          element.position.y * scale
        )
      } else {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(
            img,
            element.position.x * scale,
            element.position.y * scale,
            element.position.width * scale,
            element.position.height * scale
          )
        }
        img.src = element.data
      }
    })
    
    // Draw preview element
    if (pendingElement.type === 'text') {
      ctx.font = `italic ${pendingElement.data.fontSize * scale}px cursive`
      ctx.fillStyle = pendingElement.data.color
      ctx.globalAlpha = 0.7
      ctx.fillText(
        pendingElement.data.text,
        previewPosition.x,
        previewPosition.y
      )
      ctx.globalAlpha = 1.0
    } else if (pendingElement.type === 'signature-stamp') {
      // Draw signature stamp preview
      const stampWidth = pendingElement.size.width * scale
      const stampHeight = pendingElement.size.height * scale
      const stampX = previewPosition.x - stampWidth / 2
      const stampY = previewPosition.y - stampHeight / 2
      
      ctx.globalAlpha = 0.7
      // Background
      ctx.fillStyle = 'rgb(242, 242, 255)'
      ctx.fillRect(stampX, stampY, stampWidth, stampHeight)
      // Border
      ctx.strokeStyle = 'rgb(0, 0, 128)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(stampX, stampY, stampWidth, stampHeight)
      // Text
      ctx.fillStyle = 'rgb(0, 0, 128)'
      ctx.font = `bold ${10 * scale}px Arial`
      ctx.fillText('SIGNÉ ÉLECTRONIQUEMENT', stampX + 10, stampY + 20)
      ctx.font = `${9 * scale}px Arial`
      ctx.fillStyle = 'black'
      ctx.fillText(`Signataire: ${pendingElement.data.name || 'Non spécifié'}`, stampX + 10, stampY + 40)
      ctx.font = `${8 * scale}px Arial`
      ctx.fillStyle = 'gray'
      ctx.fillText(`Raison: ${pendingElement.data.reason}`, stampX + 10, stampY + 60)
      ctx.globalAlpha = 1.0
    } else {
      const img = new Image()
      img.onload = () => {
        ctx.globalAlpha = 0.7
        ctx.drawImage(
          img,
          previewPosition.x - (pendingElement.size.width * scale) / 2,
          previewPosition.y - (pendingElement.size.height * scale) / 2,
          pendingElement.size.width * scale,
          pendingElement.size.height * scale
        )
        ctx.globalAlpha = 1.0
      }
      img.src = pendingElement.data
    }
  }

  const restoreCanvasWithElements = () => {
    if (!savedCanvasRef.current || !pdfCanvasRef.current) return
    
    const ctx = pdfCanvasRef.current.getContext('2d')
    ctx.putImageData(savedCanvasRef.current, 0, 0)
    
    // Redraw placed elements
    const scale = currentScaleRef.current
    placedElements.filter(el => el.position.page === currentPage).forEach(element => {
      if (element.type === 'text') {
        ctx.font = `italic ${element.data.fontSize * scale}px cursive`
        ctx.fillStyle = element.data.color
        ctx.fillText(
          element.data.text,
          element.position.x * scale,
          element.position.y * scale
        )
      } else {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(
            img,
            element.position.x * scale,
            element.position.y * scale,
            element.position.width * scale,
            element.position.height * scale
          )
        }
        img.src = element.data
      }
    })
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptÃ©es')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      // Load image to get natural size
      const img = new Image()
      img.onload = () => {
        setImageNaturalSize({ width: img.width, height: img.height })
        setSignatureImage(e.target.result)
        toast.success('Image chargÃ©e')
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  // Drawing functions
  const getCanvasCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = drawCanvasRef.current
    const { x, y } = getCanvasCoords(e, canvas)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = drawCanvasRef.current
    const { x, y } = getCanvasCoords(e, canvas)
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.strokeStyle = textColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Placement functions
  const startPlaceText = () => {
    if (!signatureText.trim()) {
      toast.error('Entrez du texte d\'abord')
      return
    }
    setPlacementMode('text')
    setPendingElement({
      type: 'text',
      data: { text: signatureText, color: textColor, fontSize }
    })
  }

  const startPlaceImage = () => {
    if (!signatureImage) {
      toast.error('Chargez une image d\'abord')
      return
    }
    setPlacementMode('image')
    // Calculate size preserving aspect ratio
    const aspectRatio = imageNaturalSize.width / imageNaturalSize.height
    let width = 200
    let height = width / aspectRatio
    if (height > 150) {
      height = 150
      width = height * aspectRatio
    }
    setPendingElement({
      type: 'image',
      data: signatureImage,
      size: { width, height }
    })
  }

  const startPlaceDrawing = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    
    // Check if there's actually drawing
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let hasContent = false
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 250 || data[i+1] < 250 || data[i+2] < 250) {
        hasContent = true
        break
      }
    }
    
    if (!hasContent) {
      toast.error('Dessinez quelque chose d\'abord')
      return
    }
    
    setPlacementMode('drawing')
    setPendingElement({
      type: 'drawing',
      data: canvas.toDataURL(),
      size: { width: 250, height: 100 }
    })
  }

  const startPlaceSignatureStamp = () => {
    if (!certificate) {
      toast.error('Sélectionnez un certificat d\'abord')
      return
    }
    setPlacementMode('signature-stamp')
    setPendingElement({
      type: 'signature-stamp',
      data: { name: signerName, reason: signatureReason },
      size: { width: 250, height: 100 }
    })
    toast.info('Cliquez sur le PDF pour placer la signature')
  }

  const handlePdfMouseMove = (e) => {
    if (!placementMode || !pendingElement) return
    
    const canvas = pdfCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert to canvas coordinates
    const canvasX = x * (canvas.width / rect.width)
    const canvasY = y * (canvas.height / rect.height)
    
    setPreviewPosition({ x: canvasX, y: canvasY })
    
    // Draw preview overlay without re-rendering PDF
    requestAnimationFrame(() => drawPreviewOverlay())
  }

  const handlePdfMouseLeave = () => {
    setPreviewPosition(null)
    restoreCanvasWithElements()
  }

  const handlePdfClick = (e) => {
    if (!placementMode || !pendingElement) return
    
    const canvas = pdfCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    
    // Use the same scale as preview and rendering
    const scale = currentScaleRef.current
    
    let position
    if (pendingElement.type === 'text') {
      position = {
        x: x / scale,
        y: y / scale,
        page: currentPage
      }
    } else if (pendingElement.type === 'signature-stamp') {
      // Center the stamp on click position
      position = {
        x: (x - (pendingElement.size.width * scale) / 2) / scale,
        y: (y - (pendingElement.size.height * scale) / 2) / scale,
        width: pendingElement.size.width,
        height: pendingElement.size.height,
        page: currentPage
      }
      setSignatureStampPosition(position)
      setPlacementMode(null)
      setPendingElement(null)
      setPreviewPosition(null)
      toast.success('Position de signature enregistrée ! Cliquez sur "Signer Électroniquement"')
      return
    } else {
      // Center the element on click position (same as preview)
      position = {
        x: (x - (pendingElement.size.width * scale) / 2) / scale,
        y: (y - (pendingElement.size.height * scale) / 2) / scale,
        width: pendingElement.size.width,
        height: pendingElement.size.height,
        page: currentPage
      }
    }
    
    setPlacedElements([...placedElements, {
      type: pendingElement.type,
      data: pendingElement.data,
      position
    }])
    
    setPlacementMode(null)
    setPendingElement(null)
    setPreviewPosition(null)
    toast.success(`${pendingElement.type === 'text' ? 'Texte' : pendingElement.type === 'image' ? 'Image' : 'Dessin'} placé !`)
  }

  const signPdf = async () => {
    console.log('=== DEBUT signPdf() ===')
    console.log('Nombre d\'éléments placés:', placedElements.length)
    console.log('Éléments:', placedElements)
    
    if (!pdfDoc || placedElements.length === 0) {
      toast.error('Placez au moins un élément sur le PDF')
      return
    }

    setIsProcessing(true)

    try {
      const pdfBytes = await pdfDoc.save()
      const pdfDocCopy = await PDFDocument.load(pdfBytes)
      const pages = pdfDocCopy.getPages()
      
      console.log('=== TRAITEMENT DES ELEMENTS ===')

      for (const element of placedElements) {
        const page = pages[element.position.page]
        const { width: pageWidth, height: pageHeight } = page.getSize()
        
        // Get viewport info used when placing the element
        const viewportInfo = viewportDimensionsRef.current.get(element.position.page)
        if (!viewportInfo) {
          console.warn('No viewport info for page', element.position.page)
          continue
        }
        
        const rotation = viewportInfo.rotation || 0
        
        console.log('Page', element.position.page, 'PageSize:', pageWidth, 'x', pageHeight, 'ViewportSize:', viewportInfo.viewportWidth, 'x', viewportInfo.viewportHeight, 'Rotation:', rotation)
        console.log('Element position (viewport coords):', element.position.x, element.position.y)

        let pdfX, pdfY, pdfWidth, pdfHeight

        // Transform coordinates based on rotation
        if (rotation === 0) {
          // No rotation - simple coordinate conversion
          pdfX = element.position.x
          pdfY = pageHeight - element.position.y
          pdfWidth = element.position.width
          pdfHeight = element.position.height
        } else if (rotation === 90) {
          // 90° rotation: viewport is rotated 90° clockwise
          pdfX = element.position.y
          pdfY = element.position.x
          pdfWidth = element.position.height
          pdfHeight = element.position.width
        } else if (rotation === 180) {
          // 180° rotation
          pdfX = pageWidth - element.position.x
          pdfY = element.position.y
          pdfWidth = element.position.width
          pdfHeight = element.position.height
        } else if (rotation === 270) {
          // 270° rotation: viewport (596x842) -> PDF native (842x596)
          // Viewport X (0-596) corresponds to PDF Y (0-596)
          // Viewport Y (0-842) corresponds to PDF X (842-0)
          pdfX = pageWidth - element.position.y
          pdfY = element.position.x
          pdfWidth = element.position.height
          pdfHeight = element.position.width
        }

        if (element.type === 'text') {
          const font = await pdfDocCopy.embedFont(StandardFonts.HelveticaBoldOblique)
          
          console.log('Text position - Canvas:', element.position.x, element.position.y, '→ PDF:', pdfX, pdfY, 'Rotation:', rotation)
          
          // Prepare text options
          const textOptions = {
            x: pdfX,
            y: pdfY,
            size: element.data.fontSize,
            font,
            color: rgb(
              parseInt(element.data.color.slice(1, 3), 16) / 255,
              parseInt(element.data.color.slice(3, 5), 16) / 255,
              parseInt(element.data.color.slice(5, 7), 16) / 255
            )
          }
          
          // Add rotation to text if page is rotated
          if (rotation !== 0) {
            // Rotate text to match page rotation to keep it upright
            textOptions.rotate = { type: 'degrees', angle: rotation }
          }
          
          page.drawText(element.data.text, textOptions)
        } else {
          const imageBytes = await fetch(element.data).then(r => r.arrayBuffer())
          
          // Embed image based on format
          let image
          try {
            // Try PNG first (works for PNG and transparent images)
            image = await pdfDocCopy.embedPng(imageBytes)
          } catch (e) {
            try {
              // Fallback to JPEG
              image = await pdfDocCopy.embedJpg(imageBytes)
            } catch (err) {
              console.error('Erreur chargement image:', err)
              continue
            }
          }
          
          // For images, adjust Y to account for height (images draw from bottom-left)
          const finalY = pdfY - pdfHeight
          
          console.log('Image position - Canvas:', element.position.x, element.position.y, element.position.width, element.position.height, '→ PDF:', pdfX, finalY, pdfWidth, pdfHeight)
          
          page.drawImage(image, {
            x: pdfX,
            y: finalY,
            width: pdfWidth,
            height: pdfHeight
          })
        }
      }

      const signedPdfBytes = await pdfDocCopy.save()
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf', '-signed.pdf')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('PDF signé avec succès !')
      setPlacedElements([])
    } catch (error) {
      console.error('Erreur signature:', error)
      toast.error('Erreur lors de la signature du PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const digitalSign = async () => {
    if (!file) {
      toast.error('Chargez un PDF d\'abord')
      return
    }

    if (digitalSignMethod === 'certificate' && !certificate) {
      toast.error('Sélectionnez un certificat')
      return
    }
    
    if (digitalSignMethod === 'eid' && !eidPin) {
      toast.error('Entrez votre code PIN eID')
      return
    }
    
    if ((digitalSignMethod === 'itsme' || digitalSignMethod === 'csam') && !authCode) {
      toast.error('Authentification requise')
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('signMethod', digitalSignMethod)
      formData.append('reason', signatureReason)
      formData.append('name', signerName)
      
      if (digitalSignMethod === 'certificate') {
        formData.append('certificate', certificate)
        formData.append('certificatePassword', certificatePassword)
      } else if (digitalSignMethod === 'eid') {
        formData.append('eidPin', eidPin)
      } else if (digitalSignMethod === 'itsme' || digitalSignMethod === 'csam') {
        formData.append('authCode', authCode)
      }
      
      // Ajouter les coordonnées de la signature si elles sont définies
      if (signatureStampPosition) {
        formData.append('signatureX', signatureStampPosition.x)
        formData.append('signatureY', signatureStampPosition.y)
        formData.append('signaturePage', signatureStampPosition.page)
        formData.append('signatureWidth', signatureStampPosition.width)
        formData.append('signatureHeight', signatureStampPosition.height)
      }

      const response = await fetch('http://localhost:5000/api/v1/pdf-sign/digital-sign', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la signature')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf', '-electronically-signed.pdf')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('PDF signé électroniquement avec succès !')
      setSignatureStampPosition(null)
      setAuthCode(null) // Reset auth code
      setEidPin('') // Reset PIN
    } catch (error) {
      console.error('Erreur signature électronique:', error)
      toast.error(error.message || 'Erreur lors de la signature électronique')
    } finally {
      setIsProcessing(false)
    }
  }

  const checkEidCard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/pdf-sign/eid/check', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        toast.error(data.message || 'Middleware eID non disponible')
        return
      }
      
      setEidCardInfo(data.card)
      setSignerName(data.card.fullName)
      toast.success(`Carte eID détectée: ${data.card.fullName}`)
    } catch (error) {
      toast.error('Impossible de lire la carte eID')
    }
  }

  const initiateOAuthFlow = async (method) => {
    try {
      const endpoint = method === 'itsme' 
        ? 'http://localhost:5000/api/v1/pdf-sign/itsme/authorize'
        : 'http://localhost:5000/api/v1/pdf-sign/csam/authorize'
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (!response.ok) {
        toast.error(data.message || 'Service non configuré')
        return
      }
      
      // Ouvrir la page d'autorisation dans une nouvelle fenêtre
      window.location.href = data.authUrl
    } catch (error) {
      toast.error(`Erreur d'authentification ${method}`)
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
            Ajoutez du texte, des dessins et des images sÃ©parÃ©ment
          </p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Tous les outils
        </Link>
      </div>

      <div className="row g-3">
        {/* Left - PDF Viewer */}
        <div className="col-lg-8">
          {!file && (
            <div className="card border-0 shadow-sm">
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
          )}

          {file && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0">
                    <i className="feather-file-text me-2"></i>
                    Page {currentPage + 1}/{totalPages}
                  </h6>
                  <div className="d-flex gap-2">
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
                    <button
                      className="btn btn-sm btn-light"
                      onClick={() => {
                        setFile(null)
                        setPdfDoc(null)
                        setPdfJsDoc(null)
                        setPlacedElements([])
                      }}
                    >
                      <i className="feather-x me-1"></i>
                      Fermer
                    </button>
                  </div>
                </div>

                <div 
                  className="border rounded p-2"
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    minHeight: '500px',
                    cursor: placementMode ? 'crosshair' : 'default',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <canvas
                    ref={pdfCanvasRef}
                    onClick={handlePdfClick}
                    onMouseMove={handlePdfMouseMove}
                    onMouseLeave={handlePdfMouseLeave}
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      border: placementMode ? '2px dashed #0d6efd' : 'none'
                    }}
                  />
                </div>
                
                {placementMode && (
                  <div className="alert alert-info mt-2 mb-0">
                    <i className="feather-move me-2"></i>
                    Déplacez la souris sur le PDF pour prévisualiser, puis cliquez pour placer
                    <button
                      className="btn btn-sm btn-secondary ms-3"
                      onClick={() => {
                        setPlacementMode(null)
                        setPendingElement(null)
                        setPreviewPosition(null)
                        restoreCanvasWithElements()
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right - Tools */}
        <div className="col-lg-4">
          {/* Text */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-type me-2"></i>
                Texte
              </h6>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Votre texte..."
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                style={{ fontFamily: 'cursive' }}
              />
              <div className="d-flex gap-2 mb-2">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: '60px' }}
                />
                <input
                  type="range"
                  className="form-range flex-grow-1"
                  min="16"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <small className="text-muted">{fontSize}px</small>
              </div>
              <button
                className="btn btn-primary btn-sm w-100"
                onClick={startPlaceText}
                disabled={!file || !signatureText.trim()}
              >
                <i className="feather-mouse-pointer me-2"></i>
                Placer le texte
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-image me-2"></i>
                Image
              </h6>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="form-control form-control-sm mb-2"
              />
              {signatureImage && (
                <>
                  <img src={signatureImage} alt="Preview" className="img-fluid rounded mb-2" style={{ maxHeight: '100px' }} />
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={startPlaceImage}
                    disabled={!file}
                  >
                    <i className="feather-mouse-pointer me-2"></i>
                    Placer l'image
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Drawing */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-edit-2 me-2"></i>
                Dessin
              </h6>
              <div className="border rounded mb-2" style={{ backgroundColor: '#fff' }}>
                <canvas
                  ref={drawCanvasRef}
                  width={400}
                  height={150}
                  style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearDrawing}
                >
                  <i className="feather-trash-2 me-1"></i>
                  Effacer
                </button>
                <button
                  className="btn btn-primary btn-sm flex-grow-1"
                  onClick={startPlaceDrawing}
                  disabled={!file}
                >
                  <i className="feather-mouse-pointer me-2"></i>
                  Placer le dessin
                </button>
              </div>
            </div>
          </div>

          {/* Signature Électronique */}
          {file && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="feather-shield me-2"></i>
                  Signature Électronique Qualifiée
                </h6>
                
                <div className="mb-3">
                  <label className="form-label small">Méthode de signature</label>
                  <select 
                    className="form-select" 
                    value={digitalSignMethod}
                    onChange={(e) => {
                      setDigitalSignMethod(e.target.value)
                      setAuthCode(null) // Reset auth code on method change
                    }}
                  >
                    {availableMethods.map(method => (
                      <option 
                        key={method.id} 
                        value={method.id} 
                        disabled={!method.available}
                      >
                        {method.name} {!method.available && '(non disponible)'}
                      </option>
                    ))}
                  </select>
                  {availableMethods.length === 0 && (
                    <small className="text-muted">Chargement des méthodes...</small>
                  )}
                </div>

                {digitalSignMethod === 'certificate' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label small">Certificat (.p12 / .pfx)</label>
                      <input
                        type="file"
                        accept=".p12,.pfx"
                        onChange={(e) => setCertificate(e.target.files[0])}
                        className="form-control"
                      />
                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm w-100"
                          onClick={async () => {
                            try {
                              const response = await fetch('http://localhost:5000/api/v1/pdf-sign/demo-certificate')
                              if (!response.ok) throw new Error('Certificat non disponible')
                              const blob = await response.blob()
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = 'demo-certificate.p12'
                              a.click()
                              URL.revokeObjectURL(url)
                              toast.success('Certificat de test téléchargé! Mot de passe: "demo"')
                            } catch (error) {
                              toast.error('Impossible de télécharger le certificat de test')
                            }
                          }}
                        >
                          <i className="feather-download me-1"></i>
                          Télécharger un certificat de test
                        </button>
                        <small className="text-muted d-block mt-1">
                          Mot de passe du certificat de test: <strong>demo</strong>
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small">Mot de passe du certificat</label>
                      <input
                        type="password"
                        value={certificatePassword}
                        onChange={(e) => setCertificatePassword(e.target.value)}
                        className="form-control"
                        placeholder="Mot de passe"
                      />
                    </div>
                  </>
                )}

                {digitalSignMethod === 'eid' && (
                  <>
                    <div className="alert alert-info py-2 mb-3">
                      <i className="feather-info me-2"></i>
                      Assurez-vous que votre carte eID est insérée dans le lecteur
                    </div>
                    
                    <button
                      className="btn btn-outline-primary w-100 mb-3"
                      onClick={checkEidCard}
                      disabled={isProcessing}
                    >
                      <i className="feather-credit-card me-2"></i>
                      Vérifier la carte eID
                    </button>
                    
                    {eidCardInfo && (
                      <div className="alert alert-success py-2 mb-3">
                        <i className="feather-check-circle me-2"></i>
                        Carte détectée: {eidCardInfo.fullName}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label className="form-label small">Code PIN eID</label>
                      <input
                        type="password"
                        value={eidPin}
                        onChange={(e) => setEidPin(e.target.value)}
                        className="form-control"
                        placeholder="Votre code PIN à 4 chiffres"
                        maxLength={4}
                      />
                      <small className="text-muted">Votre code PIN sera demandé pour signer le document</small>
                    </div>
                  </>
                )}

                {(digitalSignMethod === 'itsme' || digitalSignMethod === 'csam') && (
                  <>
                    <div className="alert alert-info py-2 mb-3">
                      <i className="feather-info me-2"></i>
                      {digitalSignMethod === 'itsme' 
                        ? 'Vous serez redirigé vers l\'application itsme® pour signer'
                        : 'Vous serez redirigé vers MyGov.be pour vous authentifier'}
                    </div>
                    
                    {!authCode ? (
                      <button
                        className="btn btn-primary w-100 mb-3"
                        onClick={() => initiateOAuthFlow(digitalSignMethod)}
                        disabled={isProcessing}
                      >
                        <i className="feather-log-in me-2"></i>
                        {digitalSignMethod === 'itsme' 
                          ? 'Se connecter avec itsme®'
                          : 'Se connecter avec MyGov.be'}
                      </button>
                    ) : (
                      <div className="alert alert-success py-2 mb-3">
                        <i className="feather-check-circle me-2"></i>
                        Authentification réussie ! Vous pouvez maintenant signer le document.
                      </div>
                    )}
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label small">Nom du signataire</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="form-control"
                    placeholder="Votre nom"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small">Raison de la signature</label>
                  <input
                    type="text"
                    value={signatureReason}
                    onChange={(e) => setSignatureReason(e.target.value)}
                    className="form-control"
                    placeholder="Ex: Approbation du document"
                  />
                </div>

                <button
                  className="btn btn-outline-primary w-100 mb-2"
                  onClick={startPlaceSignatureStamp}
                  disabled={isProcessing || (digitalSignMethod === 'certificate' && !certificate)}
                >
                  <i className="feather-crosshair me-2"></i>
                  {signatureStampPosition ? 'Repositionner la signature' : 'Placer la signature sur le PDF'}
                </button>
                
                {signatureStampPosition && (
                  <div className="alert alert-success py-2 mb-2">
                    <i className="feather-check-circle me-2"></i>
                    Signature placée à la page {signatureStampPosition.page + 1}
                  </div>
                )}

                <button
                  className="btn btn-primary w-100"
                  onClick={digitalSign}
                  disabled={isProcessing || (digitalSignMethod === 'certificate' && !certificate)}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signature en cours...
                    </>
                  ) : (
                    <>
                      <i className="feather-shield me-2"></i>
                      Signer Électroniquement
                    </>
                  )}
                </button>

                <div className="mt-2">
                  <small className="text-muted">
                    <i className="feather-info me-1"></i>
                    La signature électronique garantit l'authenticité du document
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">
                <i className="feather-check me-2"></i>
                Actions
              </h6>
              <div className="mb-2 text-muted small">
                {placedElements.length} élément(s) placé(s)
              </div>
              <button
                className="btn btn-success w-100 mb-2"
                onClick={signPdf}
                disabled={isProcessing || !file || placedElements.length === 0}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signature en cours...
                  </>
                ) : (
                  <>
                    <i className="feather-download me-2"></i>
                    Télécharger le PDF signé
                  </>
                )}
              </button>
              {placedElements.length > 0 && (
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => setPlacedElements([])}
                >
                  <i className="feather-trash-2 me-2"></i>
                  Supprimer tous les éléments
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
