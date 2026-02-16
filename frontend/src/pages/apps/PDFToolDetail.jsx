import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JSZip from 'jszip'
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib'
import { PDF_TOOLS_BY_SLUG } from './pdfToolsCatalog'

function defaultOptions(slug) {
  switch (slug) {
    case 'split-pdf':
      return { mode: 'range', range: '1-3' }
    case 'compress-pdf':
      return { level: 'recommended' }
    case 'protect-pdf':
      return { password: '', confirmPassword: '' }
    case 'unlock-pdf':
      return { password: '' }
    case 'watermark-pdf':
      return { watermarkType: 'text', watermarkText: 'CONFIDENTIEL', opacity: 30 }
    case 'rotate-pdf':
      return { angle: '90' }
    case 'page-numbers':
      return { position: 'bottom-right', startAt: 1 }
    case 'ocr-pdf':
      return { language: 'fr' }
    case 'translate-pdf':
      return { targetLang: 'en' }
    case 'jpg-to-pdf':
      return { orientation: 'portrait', margin: 'normal' }
    default:
      return {}
  }
}

function baseName(filename) {
  return filename.replace(/\.[^/.]+$/, '')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function parsePageSelection(rangeValue, totalPages) {
  const tokens = (rangeValue || '').split(',').map(item => item.trim()).filter(Boolean)
  const pages = new Set()

  for (const token of tokens) {
    if (token.includes('-')) {
      const [startRaw, endRaw] = token.split('-').map(item => Number(item.trim()))
      if (Number.isNaN(startRaw) || Number.isNaN(endRaw)) continue
      const start = Math.max(1, Math.min(startRaw, totalPages))
      const end = Math.max(1, Math.min(endRaw, totalPages))
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let page = from; page <= to; page += 1) pages.add(page)
    } else {
      const page = Number(token)
      if (!Number.isNaN(page) && page >= 1 && page <= totalPages) pages.add(page)
    }
  }

  return [...pages].sort((a, b) => a - b)
}

async function mergePdfFiles(files) {
  const merged = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const current = await PDFDocument.load(bytes)
    const indices = current.getPageIndices()
    const copiedPages = await merged.copyPages(current, indices)
    copiedPages.forEach(page => merged.addPage(page))
  }

  return merged.save()
}

async function splitPdfFile(file, options) {
  const source = await PDFDocument.load(await file.arrayBuffer())
  const totalPages = source.getPageCount()

  if (options.mode === 'all') {
    const zip = new JSZip()

    for (let index = 0; index < totalPages; index += 1) {
      const part = await PDFDocument.create()
      const [copied] = await part.copyPages(source, [index])
      part.addPage(copied)
      const partBytes = await part.save()
      zip.file(`${baseName(file.name)}-page-${index + 1}.pdf`, partBytes)
    }

    return {
      type: 'zip',
      filename: `${baseName(file.name)}-split.zip`,
      bytes: await zip.generateAsync({ type: 'uint8array' })
    }
  }

  const selectedPages = parsePageSelection(options.range, totalPages)
  if (!selectedPages.length) {
    throw new Error('La plage de pages est invalide. Exemple: 1-3,5,8')
  }

  const output = await PDFDocument.create()
  const copied = await output.copyPages(source, selectedPages.map(page => page - 1))
  copied.forEach(page => output.addPage(page))

  return {
    type: 'pdf',
    filename: `${baseName(file.name)}-split.pdf`,
    bytes: await output.save()
  }
}

async function rotatePdfFiles(files, angle) {
  const zip = new JSZip()
  const value = Number(angle) || 90

  for (const file of files) {
    const document = await PDFDocument.load(await file.arrayBuffer())
    document.getPages().forEach(page => {
      page.setRotation(degrees(value))
    })
    zip.file(`${baseName(file.name)}-rotated.pdf`, await document.save())
  }

  return {
    type: files.length > 1 ? 'zip' : 'pdf',
    filename: files.length > 1 ? 'rotated-pdfs.zip' : `${baseName(files[0].name)}-rotated.pdf`,
    bytes: files.length > 1 ? await zip.generateAsync({ type: 'uint8array' }) : await PDFDocument.load(await files[0].arrayBuffer()).then(async (original) => {
      original.getPages().forEach(page => page.setRotation(degrees(value)))
      return original.save()
    })
  }
}

function pageNumberCoordinates(page, position, margin) {
  const width = page.getWidth()
  const height = page.getHeight()

  if (position === 'top-left') return { x: margin, y: height - margin }
  if (position === 'top-right') return { x: width - margin, y: height - margin }
  if (position === 'bottom-left') return { x: margin, y: margin }
  if (position === 'center') return { x: width / 2, y: margin }
  return { x: width - margin, y: margin }
}

async function addPageNumbers(files, options) {
  const zip = new JSZip()
  const startAt = Math.max(1, Number(options.startAt) || 1)

  for (const file of files) {
    const doc = await PDFDocument.load(await file.arrayBuffer())
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const pages = doc.getPages()

    pages.forEach((page, index) => {
      const label = String(startAt + index)
      const { x, y } = pageNumberCoordinates(page, options.position, 24)
      page.drawText(label, {
        x,
        y,
        size: 11,
        font,
        color: rgb(0.15, 0.15, 0.15)
      })
    })

    zip.file(`${baseName(file.name)}-numbered.pdf`, await doc.save())
  }

  return {
    type: files.length > 1 ? 'zip' : 'pdf',
    filename: files.length > 1 ? 'numbered-pdfs.zip' : `${baseName(files[0].name)}-numbered.pdf`,
    bytes: files.length > 1 ? await zip.generateAsync({ type: 'uint8array' }) : await PDFDocument.load(await files[0].arrayBuffer()).then(async (single) => {
      const font = await single.embedFont(StandardFonts.Helvetica)
      single.getPages().forEach((page, index) => {
        const label = String(startAt + index)
        const { x, y } = pageNumberCoordinates(page, options.position, 24)
        page.drawText(label, { x, y, size: 11, font, color: rgb(0.15, 0.15, 0.15) })
      })
      return single.save()
    })
  }
}

async function addTextWatermark(files, options) {
  if (options.watermarkType !== 'text') {
    throw new Error('Filigrane image non implémenté côté frontend pour le moment.')
  }

  const zip = new JSZip()
  const text = (options.watermarkText || '').trim() || 'WATERMARK'
  const opacity = Math.max(0, Math.min(100, Number(options.opacity) || 30)) / 100

  for (const file of files) {
    const doc = await PDFDocument.load(await file.arrayBuffer())
    const font = await doc.embedFont(StandardFonts.HelveticaBold)

    doc.getPages().forEach(page => {
      const width = page.getWidth()
      const height = page.getHeight()
      page.drawText(text, {
        x: width * 0.2,
        y: height * 0.5,
        size: Math.max(24, Math.min(width, height) * 0.08),
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity,
        rotate: degrees(35)
      })
    })

    zip.file(`${baseName(file.name)}-watermark.pdf`, await doc.save())
  }

  return {
    type: files.length > 1 ? 'zip' : 'pdf',
    filename: files.length > 1 ? 'watermarked-pdfs.zip' : `${baseName(files[0].name)}-watermark.pdf`,
    bytes: files.length > 1 ? await zip.generateAsync({ type: 'uint8array' }) : await PDFDocument.load(await files[0].arrayBuffer()).then(async (single) => {
      const font = await single.embedFont(StandardFonts.HelveticaBold)
      single.getPages().forEach(page => {
        const width = page.getWidth()
        const height = page.getHeight()
        page.drawText(text, {
          x: width * 0.2,
          y: height * 0.5,
          size: Math.max(24, Math.min(width, height) * 0.08),
          font,
          color: rgb(0.45, 0.45, 0.45),
          opacity,
          rotate: degrees(35)
        })
      })
      return single.save()
    })
  }
}

async function convertImagesToPdf(files, options) {
  const doc = await PDFDocument.create()
  const marginMap = { none: 0, small: 12, normal: 24, big: 40 }
  const margin = marginMap[options.margin] ?? 24

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const isPng = file.type.includes('png')
    const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)

    let pageWidth = image.width + margin * 2
    let pageHeight = image.height + margin * 2

    if (options.orientation === 'portrait' && pageWidth > pageHeight) {
      const temp = pageWidth
      pageWidth = pageHeight
      pageHeight = temp
    }

    if (options.orientation === 'landscape' && pageHeight > pageWidth) {
      const temp = pageWidth
      pageWidth = pageHeight
      pageHeight = temp
    }

    const page = doc.addPage([pageWidth, pageHeight])

    const availableWidth = pageWidth - margin * 2
    const availableHeight = pageHeight - margin * 2
    const scale = Math.min(availableWidth / image.width, availableHeight / image.height)
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight
    })
  }

  return {
    type: 'pdf',
    filename: 'images-to-pdf.pdf',
    bytes: await doc.save()
  }
}

function renderOptions(slug, options, setOptions) {
  const update = (key, value) => setOptions(prev => ({ ...prev, [key]: value }))

  switch (slug) {
    case 'split-pdf':
      return (
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Mode</label>
            <select className="form-select" value={options.mode} onChange={(e) => update('mode', e.target.value)}>
              <option value="range">Plage de pages</option>
              <option value="all">Toutes les pages séparées</option>
              <option value="extract">Extraire des pages</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label">Pages</label>
            <input className="form-control" value={options.range} placeholder="Ex: 1-3,5,8" onChange={(e) => update('range', e.target.value)} />
          </div>
        </div>
      )

    case 'compress-pdf':
      return (
        <div>
          <label className="form-label">Niveau de compression</label>
          <select className="form-select" value={options.level} onChange={(e) => update('level', e.target.value)}>
            <option value="extreme">Extrême (fichier plus léger)</option>
            <option value="recommended">Recommandé</option>
            <option value="low">Faible (meilleure qualité)</option>
          </select>
          <small className="text-muted d-block mt-2">Compression binaire avancée non disponible sans backend dédié.</small>
        </div>
      )

    case 'protect-pdf':
      return (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-control" value={options.password} onChange={(e) => update('password', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Confirmer</label>
            <input type="password" className="form-control" value={options.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
          </div>
        </div>
      )

    case 'unlock-pdf':
      return (
        <div>
          <label className="form-label">Mot de passe actuel</label>
          <input type="password" className="form-control" value={options.password} onChange={(e) => update('password', e.target.value)} />
        </div>
      )

    case 'watermark-pdf':
      return (
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Type</label>
            <select className="form-select" value={options.watermarkType} onChange={(e) => update('watermarkType', e.target.value)}>
              <option value="text">Texte</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label">Contenu</label>
            <input className="form-control" value={options.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Opacité (%)</label>
            <input type="number" min="0" max="100" className="form-control" value={options.opacity} onChange={(e) => update('opacity', e.target.value)} />
          </div>
        </div>
      )

    case 'rotate-pdf':
      return (
        <div>
          <label className="form-label">Angle</label>
          <select className="form-select" value={options.angle} onChange={(e) => update('angle', e.target.value)}>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
          </select>
        </div>
      )

    case 'page-numbers':
      return (
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Position</label>
            <select className="form-select" value={options.position} onChange={(e) => update('position', e.target.value)}>
              <option value="top-left">Haut gauche</option>
              <option value="top-right">Haut droite</option>
              <option value="bottom-left">Bas gauche</option>
              <option value="bottom-right">Bas droite</option>
              <option value="center">Centre bas</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Commencer à</label>
            <input type="number" min="1" className="form-control" value={options.startAt} onChange={(e) => update('startAt', e.target.value)} />
          </div>
        </div>
      )

    case 'ocr-pdf':
      return (
        <div>
          <label className="form-label">Langue OCR</label>
          <select className="form-select" value={options.language} onChange={(e) => update('language', e.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
          </select>
        </div>
      )

    case 'translate-pdf':
      return (
        <div>
          <label className="form-label">Traduire vers</label>
          <select className="form-select" value={options.targetLang} onChange={(e) => update('targetLang', e.target.value)}>
            <option value="en">Anglais</option>
            <option value="fr">Français</option>
            <option value="es">Espagnol</option>
            <option value="de">Allemand</option>
            <option value="it">Italien</option>
          </select>
        </div>
      )

    case 'jpg-to-pdf':
      return (
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Orientation</label>
            <select className="form-select" value={options.orientation} onChange={(e) => update('orientation', e.target.value)}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Marge</label>
            <select className="form-select" value={options.margin} onChange={(e) => update('margin', e.target.value)}>
              <option value="none">Aucune</option>
              <option value="small">Petite</option>
              <option value="normal">Normale</option>
              <option value="big">Grande</option>
            </select>
          </div>
        </div>
      )

    default:
      return (
        <div className="alert alert-light border mb-0">
          Cette fonctionnalité nécessite un service backend spécialisé pour un résultat production.
        </div>
      )
  }
}

export default function PDFToolDetail() {
  const { slug } = useParams()
  const tool = PDF_TOOLS_BY_SLUG[slug]

  const [files, setFiles] = useState([])
  const [options, setOptions] = useState(() => defaultOptions(slug))
  const [isRunning, setIsRunning] = useState(false)
  const [resultMessage, setResultMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setFiles([])
    setOptions(defaultOptions(slug))
    setResultMessage('')
    setError('')
  }, [slug])

  const fileLabel = useMemo(() => {
    if (!files.length) return 'Aucun fichier sélectionné'
    if (files.length === 1) return files[0].name
    return `${files.length} fichiers sélectionnés`
  }, [files])

  if (!tool) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="alert alert-danger">Outil introuvable.</div>
        <Link to="/apps/pdf-tools" className="btn btn-light">Retour aux outils</Link>
      </div>
    )
  }

  const onSelectFiles = (event) => {
    const selected = Array.from(event.target.files || [])
    setFiles(selected)
    setError('')
  }

  const moveFile = (index, direction) => {
    setFiles(prev => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return next
    })
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const downloadResult = async (result) => {
    const mimeType = result.type === 'zip' ? 'application/zip' : 'application/pdf'
    const blob = new Blob([result.bytes], { type: mimeType })
    downloadBlob(blob, result.filename)
  }

  const onRun = async () => {
    setError('')
    setResultMessage('')

    if (!files.length) {
      setError('Ajoute au moins un fichier pour continuer.')
      return
    }

    if (slug === 'merge-pdf' && files.length < 2) {
      setError('Ajoute au moins 2 PDF pour fusionner.')
      return
    }

    if (slug === 'protect-pdf') {
      if (!options.password || options.password !== options.confirmPassword) {
        setError('Le mot de passe est requis et doit correspondre à la confirmation.')
        return
      }
    }

    if (slug === 'unlock-pdf' && !options.password) {
      setError('Le mot de passe du PDF est requis pour le déverrouiller.')
      return
    }

    setIsRunning(true)

    try {
      let result = null

      if (slug === 'merge-pdf') {
        result = {
          type: 'pdf',
          filename: 'merged.pdf',
          bytes: await mergePdfFiles(files)
        }
      } else if (slug === 'split-pdf') {
        result = await splitPdfFile(files[0], options)
      } else if (slug === 'rotate-pdf') {
        result = await rotatePdfFiles(files, options.angle)
      } else if (slug === 'page-numbers') {
        result = await addPageNumbers(files, options)
      } else if (slug === 'watermark-pdf') {
        result = await addTextWatermark(files, options)
      } else if (slug === 'jpg-to-pdf') {
        result = await convertImagesToPdf(files, options)
      } else {
        throw new Error('Cette fonction est prête côté interface, mais nécessite encore un moteur backend pour le traitement complet.')
      }

      await downloadResult(result)
      setResultMessage(`${tool.title}: traitement terminé pour ${files.length} fichier(s).`)
    } catch (runError) {
      setError(runError.message || 'Erreur pendant le traitement du fichier.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f4f5f9', minHeight: 'calc(100vh - 78px)' }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <span className={`avatar-text avatar-md rounded-3 bg-soft-secondary ${tool.color}`}><i className={tool.icon}></i></span>
            <span>{tool.title}</span>
          </h4>
          <p className="text-muted mb-0">{tool.description}</p>
        </div>
        <Link to="/apps/pdf-tools" className="btn btn-light">
          <i className="feather-arrow-left me-2"></i>
          Tous les outils
        </Link>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">1. Ajouter vos fichiers</h6>
              <div className="border rounded-3 p-3 bg-light">
                <input
                  type="file"
                  className="form-control"
                  accept={tool.accept}
                  multiple={tool.multiple}
                  onChange={onSelectFiles}
                />
                <small className="text-muted d-block mt-2">{fileLabel}</small>
              </div>

              {slug === 'merge-pdf' && files.length > 1 && (
                <div className="mt-3 border rounded-3 p-3 bg-white">
                  <h6 className="mb-2">Ordre de fusion</h6>
                  <div className="d-flex flex-column gap-2">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="d-flex align-items-center justify-content-between border rounded p-2">
                        <div className="text-truncate me-3">
                          <span className="badge bg-soft-primary text-primary me-2">{index + 1}</span>
                          {file.name}
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-light" onClick={() => moveFile(index, -1)} disabled={index === 0}><i className="feather-arrow-up"></i></button>
                          <button type="button" className="btn btn-light" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}><i className="feather-arrow-down"></i></button>
                          <button type="button" className="btn btn-light text-danger" onClick={() => removeFile(index)}><i className="feather-x"></i></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h6 className="mt-4 mb-3">2. Options</h6>
              {renderOptions(slug, options, setOptions)}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">3. Lancer</h6>
              <button type="button" className="btn btn-primary w-100" onClick={onRun} disabled={isRunning}>
                {isRunning ? 'Traitement...' : tool.action}
              </button>

              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
              {resultMessage && <div className="alert alert-success mt-3 mb-0">{resultMessage}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
