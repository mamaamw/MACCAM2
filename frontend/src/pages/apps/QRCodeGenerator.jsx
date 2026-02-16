import { useEffect, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import api from '../../lib/axios'

const QR_TYPES = [
  { key: 'link', label: 'Link', icon: 'feather-link' },
  { key: 'text', label: 'Text', icon: 'feather-align-left' },
  { key: 'email', label: 'E-mail', icon: 'feather-mail' },
  { key: 'call', label: 'Call', icon: 'feather-phone-call' },
  { key: 'sms', label: 'SMS', icon: 'feather-message-circle' },
  { key: 'vcard', label: 'V-card', icon: 'feather-credit-card' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'feather-message-square' },
  { key: 'wifi', label: 'WI-FI', icon: 'feather-wifi' },
  { key: 'pdf', label: 'PDF', icon: 'feather-file-text' },
  { key: 'app', label: 'App', icon: 'feather-smartphone' },
  { key: 'images', label: 'Images', icon: 'feather-image' },
  { key: 'video', label: 'Video', icon: 'feather-play-circle' },
  { key: 'social', label: 'Social Media', icon: 'feather-share-2' },
  { key: 'event', label: 'Event', icon: 'feather-calendar' },
  { key: 'barcode2d', label: '2D Barcode', icon: 'feather-sidebar' }
]

const FRAME_PRESETS = [
  { key: 'none', label: 'None', phrase: '' },
  { key: 'scan', label: 'Scan Me', phrase: 'SCAN ME' },
  { key: 'visit', label: 'Visit', phrase: 'VISIT NOW' },
  { key: 'menu', label: 'Menu', phrase: 'OPEN MENU' },
  { key: 'pay', label: 'Pay', phrase: 'PAY HERE' },
  { key: 'wifi', label: 'Wi-Fi', phrase: 'CONNECT WI-FI' }
]

const DOT_STYLES = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded']
const CORNER_STYLES = ['square', 'dot', 'extra-rounded']
const CENTER_STYLES = ['square', 'dot']
const PHRASE_FONTS = ['Sans-Serif', 'Serif', 'Monospace', 'Poppins', 'Inter']

const LOGO_PRESETS = [
  { key: 'none', label: 'No logo', value: '' },
  { key: 'brand', label: 'Brand', value: '/assets/images/logo/logo-abbr.png' },
  { key: 'mail', label: 'Mail', value: '/assets/images/general/2.png' },
  { key: 'support', label: 'Support', value: '/assets/images/general/3.png' },
  { key: 'app', label: 'App', value: '/assets/images/general/4.png' }
]

const DEFAULT_FORM = {
  link: '',
  text: '',
  email: '',
  subject: '',
  body: '',
  phone: '',
  smsBody: '',
  vName: '',
  vPhone: '',
  vEmail: '',
  vCompany: '',
  vWebsite: '',
  waPhone: '',
  waMessage: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  pdfUrl: '',
  appUrl: '',
  imageUrl: '',
  videoUrl: '',
  socialUrl: '',
  eventTitle: '',
  eventLocation: '',
  eventStart: '',
  eventEnd: '',
  barcodeValue: ''
}

function buildPayload(type, form) {
  switch (type) {
    case 'link':
      return form.link.trim()
    case 'text':
      return form.text.trim()
    case 'email': {
      const email = form.email.trim()
      if (!email) return ''
      const params = new URLSearchParams()
      if (form.subject.trim()) params.set('subject', form.subject.trim())
      if (form.body.trim()) params.set('body', form.body.trim())
      const query = params.toString()
      return `mailto:${email}${query ? `?${query}` : ''}`
    }
    case 'call':
      return form.phone.trim() ? `tel:${form.phone.trim()}` : ''
    case 'sms': {
      const phone = form.phone.trim()
      if (!phone) return ''
      const body = form.smsBody.trim()
      return body ? `sms:${phone}?body=${encodeURIComponent(body)}` : `sms:${phone}`
    }
    case 'vcard': {
      if (!form.vName.trim()) return ''
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${form.vName.trim()}`,
        form.vCompany.trim() ? `ORG:${form.vCompany.trim()}` : '',
        form.vPhone.trim() ? `TEL:${form.vPhone.trim()}` : '',
        form.vEmail.trim() ? `EMAIL:${form.vEmail.trim()}` : '',
        form.vWebsite.trim() ? `URL:${form.vWebsite.trim()}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n')
    }
    case 'whatsapp': {
      const phone = form.waPhone.trim().replace(/[^\d]/g, '')
      if (!phone) return ''
      const msg = form.waMessage.trim()
      return `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
    }
    case 'wifi': {
      const ssid = form.wifiSsid.trim()
      if (!ssid) return ''
      return `WIFI:T:${form.wifiSecurity};S:${ssid};P:${form.wifiPassword.trim()};;`
    }
    case 'pdf':
      return form.pdfUrl.trim()
    case 'app':
      return form.appUrl.trim()
    case 'images':
      return form.imageUrl.trim()
    case 'video':
      return form.videoUrl.trim()
    case 'social':
      return form.socialUrl.trim()
    case 'event': {
      if (!form.eventTitle.trim()) return ''
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${form.eventTitle.trim()}`,
        form.eventLocation.trim() ? `LOCATION:${form.eventLocation.trim()}` : '',
        form.eventStart ? `DTSTART:${form.eventStart.replace(/[-:]/g, '').slice(0, 15)}00` : '',
        form.eventEnd ? `DTEND:${form.eventEnd.replace(/[-:]/g, '').slice(0, 15)}00` : '',
        'END:VEVENT'
      ].filter(Boolean).join('\n')
    }
    case 'barcode2d':
      return form.barcodeValue.trim()
    default:
      return ''
  }
}

export default function QRCodeGenerator() {
  const qrRef = useRef(null)
  const qrInstance = useRef(null)

  const [type, setType] = useState('link')
  const [form, setForm] = useState(DEFAULT_FORM)

  const [designTab, setDesignTab] = useState('Frame')
  const [framePreset, setFramePreset] = useState('scan')
  const [framePhrase, setFramePhrase] = useState('SCAN ME')
  const [phraseFont, setPhraseFont] = useState('Sans-Serif')
  const [frameColor, setFrameColor] = useState('#000000')

  const [dotStyle, setDotStyle] = useState('rounded')
  const [cornerStyle, setCornerStyle] = useState('square')
  const [centerStyle, setCenterStyle] = useState('square')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [shapeColor, setShapeColor] = useState('#000000')
  const [borderColor, setBorderColor] = useState('#000000')
  const [centerColor, setCenterColor] = useState('#000000')
  const [transparentBackground, setTransparentBackground] = useState(false)
  const [gradientEnabled, setGradientEnabled] = useState(false)

  const [logoPreset, setLogoPreset] = useState('none')
  const [logoUpload, setLogoUpload] = useState('')
  const [mediaUploadState, setMediaUploadState] = useState({
    images: { uploading: false, fileName: '', error: '' },
    video: { uploading: false, fileName: '', error: '' }
  })

  const payload = useMemo(() => buildPayload(type, form), [type, form])

  useEffect(() => {
    if (!qrInstance.current) {
      qrInstance.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'canvas',
        margin: 1,
        data: ' ',
        dotsOptions: { type: 'rounded', color: '#000000' },
        backgroundOptions: { color: '#FFFFFF' }
      })
    }

    if (qrRef.current && qrRef.current.childNodes.length === 0) {
      qrInstance.current.append(qrRef.current)
    }
  }, [])

  useEffect(() => {
    if (!qrInstance.current) return

    const selectedLogo = logoUpload || LOGO_PRESETS.find(item => item.key === logoPreset)?.value || ''

    qrInstance.current.update({
      data: payload || ' ',
      backgroundOptions: {
        color: transparentBackground ? 'transparent' : backgroundColor
      },
      dotsOptions: {
        type: dotStyle,
        color: gradientEnabled ? undefined : shapeColor,
        gradient: gradientEnabled
          ? {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: shapeColor },
                { offset: 1, color: borderColor }
              ]
            }
          : undefined
      },
      cornersSquareOptions: {
        type: cornerStyle,
        color: borderColor
      },
      cornersDotOptions: {
        type: centerStyle,
        color: centerColor
      },
      image: selectedLogo || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 4,
        imageSize: 0.24
      }
    })
  }, [payload, dotStyle, cornerStyle, centerStyle, backgroundColor, shapeColor, borderColor, centerColor, transparentBackground, gradientEnabled, logoPreset, logoUpload])

  useEffect(() => {
    const preset = FRAME_PRESETS.find(item => item.key === framePreset)
    if (!preset) return
    setFramePhrase(preset.phrase)
  }, [framePreset])

  const setValue = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const onUploadLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setLogoUpload(typeof reader.result === 'string' ? reader.result : '')
      setLogoPreset('none')
    }
    reader.readAsDataURL(file)
  }

  const onUploadContentMedia = async (event, mediaType) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMediaUploadState(prev => ({
      ...prev,
      [mediaType]: { uploading: true, fileName: file.name, error: '' }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mediaType', mediaType)

      const response = await api.post('/qr-media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const fileUrl = response?.data?.file?.url || ''
      if (!fileUrl) {
        throw new Error('URL de fichier invalide')
      }

      if (mediaType === 'images') {
        setValue('imageUrl', fileUrl)
      }

      if (mediaType === 'video') {
        setValue('videoUrl', fileUrl)
      }

      setMediaUploadState(prev => ({
        ...prev,
        [mediaType]: { uploading: false, fileName: file.name, error: '' }
      }))
    } catch (error) {
      const message = error?.response?.data?.message || 'Upload impossible'
      setMediaUploadState(prev => ({
        ...prev,
        [mediaType]: { uploading: false, fileName: file.name, error: message }
      }))
    } finally {
      event.target.value = ''
    }
  }

  const downloadQr = async () => {
    if (!payload || !qrInstance.current) return
    const blob = await qrInstance.current.getRawData('png')
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qr-${type}.png`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const renderTypeFields = () => {
    if (type === 'link') {
      return (
        <>
          <label className="form-label">Enter your Website</label>
          <input type="url" className="form-control" placeholder="https://" value={form.link} onChange={(event) => setValue('link', event.target.value)} />
        </>
      )
    }

    if (type === 'text') {
      return (
        <>
          <label className="form-label">Message</label>
          <textarea className="form-control" rows="3" placeholder="Type your text" value={form.text} onChange={(event) => setValue('text', event.target.value)}></textarea>
        </>
      )
    }

    if (type === 'email') {
      return (
        <div className="row g-2">
          <div className="col-md-6"><label className="form-label">E-mail</label><input className="form-control" value={form.email} onChange={(event) => setValue('email', event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={(event) => setValue('subject', event.target.value)} /></div>
          <div className="col-12"><label className="form-label">Body</label><textarea className="form-control" rows="2" value={form.body} onChange={(event) => setValue('body', event.target.value)}></textarea></div>
        </div>
      )
    }

    if (type === 'call') {
      return <><label className="form-label">Phone number</label><input className="form-control" placeholder="+33..." value={form.phone} onChange={(event) => setValue('phone', event.target.value)} /></>
    }

    if (type === 'sms') {
      return (
        <div className="row g-2">
          <div className="col-md-5"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(event) => setValue('phone', event.target.value)} /></div>
          <div className="col-md-7"><label className="form-label">Message</label><input className="form-control" value={form.smsBody} onChange={(event) => setValue('smsBody', event.target.value)} /></div>
        </div>
      )
    }

    if (type === 'vcard') {
      return (
        <div className="row g-2">
          <div className="col-md-6"><input className="form-control" placeholder="Full name" value={form.vName} onChange={(event) => setValue('vName', event.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Phone" value={form.vPhone} onChange={(event) => setValue('vPhone', event.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Email" value={form.vEmail} onChange={(event) => setValue('vEmail', event.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Company" value={form.vCompany} onChange={(event) => setValue('vCompany', event.target.value)} /></div>
          <div className="col-12"><input className="form-control" placeholder="Website" value={form.vWebsite} onChange={(event) => setValue('vWebsite', event.target.value)} /></div>
        </div>
      )
    }

    if (type === 'whatsapp') {
      return (
        <div className="row g-2">
          <div className="col-md-5"><input className="form-control" placeholder="Phone" value={form.waPhone} onChange={(event) => setValue('waPhone', event.target.value)} /></div>
          <div className="col-md-7"><input className="form-control" placeholder="Message" value={form.waMessage} onChange={(event) => setValue('waMessage', event.target.value)} /></div>
        </div>
      )
    }

    if (type === 'wifi') {
      return (
        <div className="row g-2">
          <div className="col-md-4"><label className="form-label">Security</label><select className="form-select" value={form.wifiSecurity} onChange={(event) => setValue('wifiSecurity', event.target.value)}><option value="WPA">WPA</option><option value="WEP">WEP</option><option value="nopass">Open</option></select></div>
          <div className="col-md-4"><label className="form-label">SSID</label><input className="form-control" value={form.wifiSsid} onChange={(event) => setValue('wifiSsid', event.target.value)} /></div>
          <div className="col-md-4"><label className="form-label">Password</label><input className="form-control" value={form.wifiPassword} onChange={(event) => setValue('wifiPassword', event.target.value)} /></div>
        </div>
      )
    }

    if (type === 'event') {
      return (
        <div className="row g-2">
          <div className="col-md-6"><input className="form-control" placeholder="Event title" value={form.eventTitle} onChange={(event) => setValue('eventTitle', event.target.value)} /></div>
          <div className="col-md-6"><input className="form-control" placeholder="Location" value={form.eventLocation} onChange={(event) => setValue('eventLocation', event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">Start</label><input type="datetime-local" className="form-control" value={form.eventStart} onChange={(event) => setValue('eventStart', event.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">End</label><input type="datetime-local" className="form-control" value={form.eventEnd} onChange={(event) => setValue('eventEnd', event.target.value)} /></div>
        </div>
      )
    }

    if (type === 'images') {
      return (
        <div className="row g-2">
          <div className="col-12">
            <label className="form-label">Image URL</label>
            <input className="form-control" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(event) => setValue('imageUrl', event.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Ou charger une image depuis votre ordinateur</label>
            <input type="file" className="form-control" accept="image/*" onChange={(event) => onUploadContentMedia(event, 'images')} />
            <small className="text-muted d-block mt-1">
              {mediaUploadState.images.uploading ? 'Upload en cours...' : mediaUploadState.images.fileName ? `Fichier: ${mediaUploadState.images.fileName}` : 'PNG, JPG, WEBP, etc.'}
            </small>
            {mediaUploadState.images.error && <small className="text-danger d-block">{mediaUploadState.images.error}</small>}
          </div>
        </div>
      )
    }

    if (type === 'video') {
      return (
        <div className="row g-2">
          <div className="col-12">
            <label className="form-label">Video URL</label>
            <input className="form-control" placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(event) => setValue('videoUrl', event.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Ou charger une vidéo depuis votre ordinateur</label>
            <input type="file" className="form-control" accept="video/*" onChange={(event) => onUploadContentMedia(event, 'video')} />
            <small className="text-muted d-block mt-1">
              {mediaUploadState.video.uploading ? 'Upload en cours...' : mediaUploadState.video.fileName ? `Fichier: ${mediaUploadState.video.fileName}` : 'MP4, MOV, WEBM, etc.'}
            </small>
            {mediaUploadState.video.error && <small className="text-danger d-block">{mediaUploadState.video.error}</small>}
          </div>
        </div>
      )
    }

    const map = {
      pdf: ['PDF URL', 'pdfUrl', 'https://example.com/file.pdf'],
      app: ['App URL', 'appUrl', 'https://apps.apple.com/...'],
      social: ['Social URL', 'socialUrl', 'https://instagram.com/...'],
      barcode2d: ['Barcode value', 'barcodeValue', '1234567890']
    }

    const [label, field, placeholder] = map[type] || ['Value', 'text', '']

    return (
      <>
        <label className="form-label">{label}</label>
        <input className="form-control" placeholder={placeholder} value={form[field]} onChange={(event) => setValue(field, event.target.value)} />
      </>
    )
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f4f6fb', minHeight: 'calc(100vh - 78px)' }}>
      <div className="row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="border rounded-3 p-2 mb-4">
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
                  {QR_TYPES.map(option => (
                    <button
                      key={option.key}
                      type="button"
                      className={`btn btn-sm ${type === option.key ? 'btn-light-brand border border-success' : 'btn-light border-0'}`}
                      onClick={() => setType(option.key)}
                    >
                      <i className={`${option.icon} me-1`}></i>{option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 pb-4 border-bottom">
                <h5 className="mb-3"><span className="badge bg-primary me-2">1</span>Complete the content</h5>
                {renderTypeFields()}
              </div>

              <div>
                <h5 className="mb-3"><span className="badge bg-primary me-2">2</span>Design your QR Code</h5>

                <ul className="nav nav-tabs mb-3">
                  {['Frame', 'Shape', 'Logo'].map(tab => (
                    <li className="nav-item" key={tab}>
                      <button type="button" className={`nav-link ${designTab === tab ? 'active' : ''}`} onClick={() => setDesignTab(tab)}>{tab}</button>
                    </li>
                  ))}
                </ul>

                {designTab === 'Frame' && (
                  <div className="border rounded-3 p-3">
                    <div className="mb-3">
                      <label className="form-label">Frame style</label>
                      <div className="d-flex flex-wrap gap-2">
                        {FRAME_PRESETS.map(item => (
                          <button key={item.key} type="button" className={`btn btn-sm ${framePreset === item.key ? 'btn-primary' : 'btn-light'}`} onClick={() => setFramePreset(item.key)}>{item.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Frame phrase</label>
                        <input className="form-control" placeholder="SCAN ME" value={framePhrase} onChange={(event) => setFramePhrase(event.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phrase font</label>
                        <select className="form-select" value={phraseFont} onChange={(event) => setPhraseFont(event.target.value)}>
                          {PHRASE_FONTS.map(font => <option key={font}>{font}</option>)}
                        </select>
                      </div>
                      <div className="col-md-8">
                        <label className="form-label">Frame color</label>
                        <input className="form-control" value={frameColor} onChange={(event) => setFrameColor(event.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label"> </label>
                        <input type="color" className="form-control form-control-color w-100" style={{ height: '42px' }} value={frameColor} onChange={(event) => setFrameColor(event.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {designTab === 'Shape' && (
                  <div className="border rounded-3 p-3">
                    <div className="mb-3">
                      <label className="form-label">Shape style</label>
                      <div className="d-flex flex-wrap gap-2">
                        {DOT_STYLES.map(style => (
                          <button key={style} type="button" className={`btn btn-sm text-capitalize ${dotStyle === style ? 'btn-primary' : 'btn-light'}`} onClick={() => setDotStyle(style)}>{style}</button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-3 bg-light mb-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Background color</label>
                          <div className="d-flex gap-2">
                            <input className="form-control" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} />
                            <input type="color" className="form-control form-control-color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Shape color</label>
                          <div className="d-flex gap-2">
                            <input className="form-control" value={shapeColor} onChange={(event) => setShapeColor(event.target.value)} />
                            <input type="color" className="form-control form-control-color" value={shapeColor} onChange={(event) => setShapeColor(event.target.value)} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch mt-2">
                            <input className="form-check-input" type="checkbox" id="transparentBg" checked={transparentBackground} onChange={(event) => setTransparentBackground(event.target.checked)} />
                            <label className="form-check-label" htmlFor="transparentBg">Transparent background</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch mt-2">
                            <input className="form-check-input" type="checkbox" id="gradientToggle" checked={gradientEnabled} onChange={(event) => setGradientEnabled(event.target.checked)} />
                            <label className="form-check-label" htmlFor="gradientToggle">Gradient</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Border style</label>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {CORNER_STYLES.map(style => (
                          <button key={style} type="button" className={`btn btn-sm text-capitalize ${cornerStyle === style ? 'btn-primary' : 'btn-light'}`} onClick={() => setCornerStyle(style)}>{style}</button>
                        ))}
                      </div>
                      <div className="d-flex gap-2">
                        <input className="form-control" value={borderColor} onChange={(event) => setBorderColor(event.target.value)} />
                        <input type="color" className="form-control form-control-color" value={borderColor} onChange={(event) => setBorderColor(event.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Center style</label>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {CENTER_STYLES.map(style => (
                          <button key={style} type="button" className={`btn btn-sm text-capitalize ${centerStyle === style ? 'btn-primary' : 'btn-light'}`} onClick={() => setCenterStyle(style)}>{style}</button>
                        ))}
                      </div>
                      <div className="d-flex gap-2">
                        <input className="form-control" value={centerColor} onChange={(event) => setCenterColor(event.target.value)} />
                        <input type="color" className="form-control form-control-color" value={centerColor} onChange={(event) => setCenterColor(event.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {designTab === 'Logo' && (
                  <div className="border rounded-3 p-3">
                    <div className="mb-3">
                      <label className="form-label">Upload Logo</label>
                      <input type="file" className="form-control" accept="image/*" onChange={onUploadLogo} />
                    </div>

                    <label className="form-label">Or choose from presets</label>
                    <div className="d-flex flex-wrap gap-2">
                      {LOGO_PRESETS.map(item => (
                        <button key={item.key} type="button" className={`btn btn-sm ${logoPreset === item.key && !logoUpload ? 'btn-primary' : 'btn-light'}`} onClick={() => { setLogoPreset(item.key); setLogoUpload('') }}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column">
              <h5 className="mb-3"><span className="badge bg-primary me-2">3</span>Download QR Code</h5>

              <div className="border rounded-3 p-3 d-flex flex-column align-items-center justify-content-center flex-grow-1" style={{ backgroundColor: '#fff' }}>
                <div className="border rounded-3 p-2" style={{ borderColor: `${frameColor}30` }}>
                  <div ref={qrRef}></div>
                </div>

                {framePhrase && (
                  <div className="mt-3 px-3 py-2 rounded-pill" style={{ backgroundColor: frameColor, color: '#fff', fontFamily: phraseFont }}>
                    {framePhrase}
                  </div>
                )}
              </div>

              <button type="button" className="btn btn-success mt-3" onClick={downloadQr} disabled={!payload}>
                <i className="feather-download me-2"></i>
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
