import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'
import api from '../../lib/axios'
import toast from '../../utils/toast'

const QR_TYPES = [
  { key: 'link', label: 'Link', icon: 'feather-link' },
  { key: 'text', label: 'Text', icon: 'feather-align-left' },
  { key: 'email', label: 'E-mail', icon: 'feather-mail' },
  { key: 'call', label: 'Call', icon: 'feather-phone-call' },
  { key: 'sms', label: 'SMS', icon: 'feather-message-circle' },
  { key: 'vcard', label: 'V-card', icon: 'feather-credit-card' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'feather-message-square' },
  { key: 'wifi', label: 'WI-FI', icon: 'feather-wifi' },
  { key: 'payment', label: 'Payment', icon: 'feather-dollar-sign' },
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
  { key: 'brand', label: 'Brand', value: '/assets/images/logo-abbr.png' },
  { key: 'full', label: 'Full Logo', value: '/assets/images/logo-full.png' },
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
  paymentType: 'paypal',
  paymentAmount: '',
  paymentCurrency: 'USD',
  paymentRecipient: '',
  paymentNote: '',
  paymentBtcAddress: '',
  paymentUpiId: '',
  paymentIban: '',
  paymentBic: '',
  paymentBeneficiary: '',
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
      return (form.link || '').trim()
    case 'text':
      return (form.text || '').trim()
    case 'email': {
      const email = (form.email || '').trim()
      if (!email) return ''
      const params = new URLSearchParams()
      if ((form.subject || '').trim()) params.set('subject', form.subject.trim())
      if ((form.body || '').trim()) params.set('body', form.body.trim())
      const query = params.toString()
      return `mailto:${email}${query ? `?${query}` : ''}`
    }
    case 'call':
      return (form.phone || '').trim() ? `tel:${form.phone.trim()}` : ''
    case 'sms': {
      const phone = (form.phone || '').trim()
      if (!phone) return ''
      const body = (form.smsBody || '').trim()
      return body ? `sms:${phone}?body=${encodeURIComponent(body)}` : `sms:${phone}`
    }
    case 'vcard': {
      if (!(form.vName || '').trim()) return ''
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${form.vName.trim()}`,
        (form.vCompany || '').trim() ? `ORG:${form.vCompany.trim()}` : '',
        (form.vPhone || '').trim() ? `TEL:${form.vPhone.trim()}` : '',
        (form.vEmail || '').trim() ? `EMAIL:${form.vEmail.trim()}` : '',
        (form.vWebsite || '').trim() ? `URL:${form.vWebsite.trim()}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n')
    }
    case 'whatsapp': {
      const phone = (form.waPhone || '').trim().replace(/[^\d]/g, '')
      if (!phone) return ''
      const msg = (form.waMessage || '').trim()
      return `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
    }
    case 'wifi': {
      const ssid = (form.wifiSsid || '').trim()
      if (!ssid) return ''
      return `WIFI:T:${form.wifiSecurity || 'WPA'};S:${ssid};P:${(form.wifiPassword || '').trim()};;`
    }
    case 'payment': {
      const paymentType = form.paymentType || 'paypal'
      const amount = (form.paymentAmount || '').trim()
      const currency = (form.paymentCurrency || 'USD').trim()
      const recipient = (form.paymentRecipient || '').trim()
      const note = (form.paymentNote || '').trim()
      
      if (paymentType === 'paypal') {
        if (!recipient) return ''
        const params = new URLSearchParams()
        params.set('cmd', '_xclick')
        params.set('business', recipient)
        if (amount) params.set('amount', amount)
        if (currency) params.set('currency_code', currency)
        if (note) params.set('item_name', note)
        return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
      }
      
      if (paymentType === 'bitcoin') {
        const btcAddress = (form.paymentBtcAddress || '').trim()
        if (!btcAddress) return ''
        let btcUrl = `bitcoin:${btcAddress}`
        const params = []
        if (amount) params.push(`amount=${amount}`)
        if (note) params.push(`label=${encodeURIComponent(note)}`)
        if (params.length > 0) btcUrl += `?${params.join('&')}`
        return btcUrl
      }
      
      if (paymentType === 'upi') {
        const upiId = (form.paymentUpiId || '').trim()
        if (!upiId) return ''
        const params = new URLSearchParams()
        params.set('pa', upiId)
        if (amount) params.set('am', amount)
        if (currency) params.set('cu', currency)
        if (note) params.set('tn', note)
        return `upi://pay?${params.toString()}`
      }
      
      if (paymentType === 'sepa') {
        const iban = (form.paymentIban || '').trim().replace(/\s/g, '')
        const beneficiary = (form.paymentBeneficiary || '').trim()
        if (!iban || !beneficiary) return ''
        
        const bic = (form.paymentBic || '').trim()
        const amountStr = amount ? `EUR${amount}` : 'EUR'
        
        // Format EPC QR Code (European Payments Council)
        return [
          'BCD',           // Service Tag
          '002',           // Version
          '1',             // Character set (UTF-8)
          'SCT',           // Identification (SEPA Credit Transfer)
          bic,             // BIC (can be empty)
          beneficiary,     // Beneficiary Name
          iban,            // Beneficiary Account (IBAN)
          amountStr,       // Amount (EUR + value)
          '',              // Purpose (empty)
          note,            // Remittance Information (Reference)
          ''               // Beneficiary to Originator Information
        ].join('\n')
      }
      
      if (paymentType === 'generic') {
        return recipient
      }
      
      return ''
    }
    case 'pdf':
      return (form.pdfUrl || '').trim()
    case 'app':
      return (form.appUrl || '').trim()
    case 'images':
      return (form.imageUrl || '').trim()
    case 'video':
      return (form.videoUrl || '').trim()
    case 'social':
      return (form.socialUrl || '').trim()
    case 'event': {
      if (!(form.eventTitle || '').trim()) return ''
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${form.eventTitle.trim()}`,
        (form.eventLocation || '').trim() ? `LOCATION:${form.eventLocation.trim()}` : '',
        form.eventStart ? `DTSTART:${form.eventStart.replace(/[-:]/g, '').slice(0, 15)}00` : '',
        form.eventEnd ? `DTEND:${form.eventEnd.replace(/[-:]/g, '').slice(0, 15)}00` : '',
        'END:VEVENT'
      ].filter(Boolean).join('\n')
    }
    case 'barcode2d':
      return (form.barcodeValue || '').trim()
    default:
      return ''
  }
}

export default function QRCodeGenerator() {
  const location = useLocation()
  const qrRef = useRef(null)
  const qrInstance = useRef(null)
  const previewSize = 280

  const [type, setType] = useState('link')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [qrName, setQrName] = useState('')
  const [currentQrId, setCurrentQrId] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)

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
  const [logoSize, setLogoSize] = useState(24)
  const [exportResolution, setExportResolution] = useState(2048)
  const [mediaUploadState, setMediaUploadState] = useState({
    images: { uploading: false, fileName: '', error: '' },
    video: { uploading: false, fileName: '', error: '' },
    pdf: { uploading: false, fileName: '', error: '' },
    app: { uploading: false, fileName: '', error: '' }
  })

  const payload = useMemo(() => buildPayload(type, form), [type, form])

  const buildQrOptions = (size, dataValue = null) => {
    // Always ensure we have valid data for QR code
    const finalData = dataValue || payload || ' '
    const selectedLogo = logoUpload || LOGO_PRESETS.find(item => item.key === logoPreset)?.value || ''

    const options = {
      width: size,
      height: size,
      type: 'canvas',
      margin: 1,
      data: finalData,
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
      }
    }

    // Only add image if we have one
    if (selectedLogo) {
      options.image = selectedLogo
      options.imageOptions = {
        crossOrigin: 'anonymous',
        margin: 4,
        imageSize: logoSize / 100
      }
    }

    return options
  }

  useEffect(() => {
    try {
      if (!qrInstance.current) {
        qrInstance.current = new QRCodeStyling(buildQrOptions(previewSize, ' '))
      }

      if (qrRef.current && qrRef.current.childNodes.length === 0) {
        qrInstance.current.append(qrRef.current)
      }
    } catch (error) {
      console.error('Error initializing QR code:', error)
    }
  }, [])

  useEffect(() => {
    if (!qrInstance.current) return

    try {
      const selectedLogo = logoUpload || LOGO_PRESETS.find(item => item.key === logoPreset)?.value || ''
      const finalData = payload || ' '
      
      console.log('🔄 Updating QR code with logo:', { logoPreset, logoUpload: logoUpload ? 'base64...' : 'empty', selectedLogo })
      
      const options = {
        width: previewSize,
        height: previewSize,
        type: 'canvas',
        margin: 1,
        data: finalData,
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
        }
      }
      
      // Only add image if we have one
      if (selectedLogo) {
        console.log('✅ Adding logo to QR:', selectedLogo.substring(0, 50))
        options.image = selectedLogo
        options.imageOptions = {
          crossOrigin: 'anonymous',
          margin: 4,
          imageSize: logoSize / 100
        }
      } else {
        console.log('⚠️ No logo selected')
      }
      
      qrInstance.current.update(options)
    } catch (error) {
      console.error('Error updating QR code:', error)
    }
  }, [payload, dotStyle, cornerStyle, centerStyle, backgroundColor, shapeColor, borderColor, centerColor, transparentBackground, gradientEnabled, logoPreset, logoUpload, logoSize])

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

      if (mediaType === 'pdf') {
        setValue('pdfUrl', fileUrl)
      }

      if (mediaType === 'app') {
        setValue('appUrl', fileUrl)
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
    if (!payload) return

    const exportQr = new QRCodeStyling(buildQrOptions(exportResolution))
    const blob = await exportQr.getRawData('png')
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qr-${type}-${exportResolution}px.png`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const saveQrSettings = async () => {
    if (!qrName.trim()) {
      setShowSaveModal(true)
      return
    }

    const settings = {
      form,
      design: {
        framePreset,
        framePhrase,
        phraseFont,
        frameColor,
        dotStyle,
        cornerStyle,
        centerStyle,
        backgroundColor,
        shapeColor,
        borderColor,
        centerColor,
        transparentBackground,
        gradientEnabled,
        logoPreset,
        logoUpload,
        logoSize,
        exportResolution
      }
    }
    
    try {
      if (currentQrId) {
        await api.put(`/qr-codes/${currentQrId}`, {
          name: qrName,
          type,
          settings: JSON.stringify(settings)
        })
        toast.success('QR mis à jour avec succès !')
      } else {
        const response = await api.post('/qr-codes', {
          name: qrName,
          type,
          settings: JSON.stringify(settings)
        })
        setCurrentQrId(response.data.qrCode.id)
        toast.success('QR sauvegardé avec succès !')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde.')
    }
  }

  const handleSaveWithName = async () => {
    if (!qrName.trim()) {
      toast.warning('Veuillez entrer un nom')
      return
    }
    setShowSaveModal(false)
    await saveQrSettings()
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
          <div className="col-md-4">
            <label className="form-label">Security</label>
            <select 
              className="form-select" 
              value={form.wifiSecurity} 
              onChange={(event) => setValue('wifiSecurity', event.target.value)}
            >
              <option value="WPA">WPA</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">SSID</label>
            <input 
              className="form-control" 
              placeholder="Nom du réseau"
              value={form.wifiSsid} 
              onChange={(event) => setValue('wifiSsid', event.target.value)} 
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Password</label>
            <input 
              type="text"
              className="form-control" 
              placeholder="Mot de passe"
              value={form.wifiPassword} 
              onChange={(event) => setValue('wifiPassword', event.target.value)} 
            />
          </div>
        </div>
      )
    }

    if (type === 'payment') {
      return (
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Payment Method</label>
            <select 
              className="form-select" 
              value={form.paymentType} 
              onChange={(event) => setValue('paymentType', event.target.value)}
            >
              <option value="paypal">PayPal</option>
              <option value="sepa">SEPA Transfer (EUR)</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="upi">UPI (India)</option>
              <option value="generic">Other/URL</option>
            </select>
          </div>
          
          {form.paymentType === 'paypal' && (
            <>
              <div className="col-md-8">
                <label className="form-label">PayPal Email/ID</label>
                <input 
                  className="form-control" 
                  placeholder="your-email@example.com"
                  value={form.paymentRecipient} 
                  onChange={(event) => setValue('paymentRecipient', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount (optional)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control" 
                  placeholder="10.00"
                  value={form.paymentAmount} 
                  onChange={(event) => setValue('paymentAmount', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Currency</label>
                <select 
                  className="form-select" 
                  value={form.paymentCurrency} 
                  onChange={(event) => setValue('paymentCurrency', event.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description (optional)</label>
                <input 
                  className="form-control" 
                  placeholder="Payment for..."
                  value={form.paymentNote} 
                  onChange={(event) => setValue('paymentNote', event.target.value)} 
                />
              </div>
            </>
          )}

          {form.paymentType === 'bitcoin' && (
            <>
              <div className="col-md-8">
                <label className="form-label">Bitcoin Address</label>
                <input 
                  className="form-control" 
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  value={form.paymentBtcAddress} 
                  onChange={(event) => setValue('paymentBtcAddress', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount in BTC (optional)</label>
                <input 
                  type="number"
                  step="0.00000001"
                  className="form-control" 
                  placeholder="0.001"
                  value={form.paymentAmount} 
                  onChange={(event) => setValue('paymentAmount', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Label (optional)</label>
                <input 
                  className="form-control" 
                  placeholder="Payment label"
                  value={form.paymentNote} 
                  onChange={(event) => setValue('paymentNote', event.target.value)} 
                />
              </div>
            </>
          )}

          {form.paymentType === 'upi' && (
            <>
              <div className="col-md-8">
                <label className="form-label">UPI ID</label>
                <input 
                  className="form-control" 
                  placeholder="username@upi"
                  value={form.paymentUpiId} 
                  onChange={(event) => setValue('paymentUpiId', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Amount (optional)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control" 
                  placeholder="100.00"
                  value={form.paymentAmount} 
                  onChange={(event) => setValue('paymentAmount', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Currency</label>
                <select 
                  className="form-select" 
                  value={form.paymentCurrency} 
                  onChange={(event) => setValue('paymentCurrency', event.target.value)}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Transaction Note (optional)</label>
                <input 
                  className="form-control" 
                  placeholder="Payment for..."
                  value={form.paymentNote} 
                  onChange={(event) => setValue('paymentNote', event.target.value)} 
                />
              </div>
            </>
          )}

          {form.paymentType === 'sepa' && (
            <>
              <div className="col-md-12">
                <label className="form-label">IBAN</label>
                <input 
                  className="form-control" 
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  value={form.paymentIban} 
                  onChange={(event) => setValue('paymentIban', event.target.value)} 
                />
                <small className="text-muted">Format: 2 lettres pays + 2 chiffres clé + max 30 caractères</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Bénéficiaire</label>
                <input 
                  className="form-control" 
                  placeholder="Nom du bénéficiaire"
                  value={form.paymentBeneficiary} 
                  onChange={(event) => setValue('paymentBeneficiary', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">BIC/SWIFT (optionnel)</label>
                <input 
                  className="form-control" 
                  placeholder="BNPAFRPPXXX"
                  value={form.paymentBic} 
                  onChange={(event) => setValue('paymentBic', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Montant en EUR (optionnel)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="form-control" 
                  placeholder="100.00"
                  value={form.paymentAmount} 
                  onChange={(event) => setValue('paymentAmount', event.target.value)} 
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Référence (optionnel)</label>
                <input 
                  className="form-control" 
                  placeholder="Facture #123"
                  value={form.paymentNote} 
                  onChange={(event) => setValue('paymentNote', event.target.value)} 
                />
              </div>
              <div className="col-12">
                <div className="alert alert-info mb-0">
                  <i className="feather-info me-2"></i>
                  Ce QR code génère un virement SEPA conforme au standard EPC (European Payments Council)
                </div>
              </div>
            </>
          )}

          {form.paymentType === 'generic' && (
            <div className="col-12">
              <label className="form-label">Payment URL</label>
              <input 
                className="form-control" 
                placeholder="https://..."
                value={form.paymentRecipient} 
                onChange={(event) => setValue('paymentRecipient', event.target.value)} 
              />
              <small className="text-muted">Enter any payment link (Stripe, Square, custom, etc.)</small>
            </div>
          )}
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

    if (type === 'pdf') {
      return (
        <div className="row g-2">
          <div className="col-12">
            <label className="form-label">PDF URL</label>
            <input className="form-control" placeholder="https://example.com/file.pdf" value={form.pdfUrl} onChange={(event) => setValue('pdfUrl', event.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Ou charger un PDF depuis votre ordinateur</label>
            <input type="file" className="form-control" accept=".pdf,application/pdf" onChange={(event) => onUploadContentMedia(event, 'pdf')} />
            <small className="text-muted d-block mt-1">
              {mediaUploadState.pdf.uploading ? 'Upload en cours...' : mediaUploadState.pdf.fileName ? `Fichier: ${mediaUploadState.pdf.fileName}` : 'PDF uniquement'}
            </small>
            {mediaUploadState.pdf.error && <small className="text-danger d-block">{mediaUploadState.pdf.error}</small>}
          </div>
        </div>
      )
    }

    if (type === 'app') {
      return (
        <div className="row g-2">
          <div className="col-12">
            <label className="form-label">App URL</label>
            <input className="form-control" placeholder="https://apps.apple.com/..." value={form.appUrl} onChange={(event) => setValue('appUrl', event.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Ou charger un fichier APK/IPA depuis votre ordinateur</label>
            <input type="file" className="form-control" accept=".apk,.ipa,application/vnd.android.package-archive" onChange={(event) => onUploadContentMedia(event, 'app')} />
            <small className="text-muted d-block mt-1">
              {mediaUploadState.app.uploading ? 'Upload en cours...' : mediaUploadState.app.fileName ? `Fichier: ${mediaUploadState.app.fileName}` : 'APK, IPA, etc.'}
            </small>
            {mediaUploadState.app.error && <small className="text-danger d-block">{mediaUploadState.app.error}</small>}
          </div>
        </div>
      )
    }

    const map = {
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

  // Charger un QR code au démarrage (depuis galerie ou dernier sauvegardé)
  useEffect(() => {
    const loadQr = async () => {
      try {
        console.log('🚀 useEffect loadQr starting...')
        // Vérifier si on doit charger un QR spécifique depuis la galerie
        const qrIdToLoad = localStorage.getItem('qr-to-load')
        console.log('🔍 qr-to-load from localStorage:', qrIdToLoad)
        
        if (qrIdToLoad) {
          localStorage.removeItem('qr-to-load')
          console.log('📡 Fetching QR code from API:', qrIdToLoad)
          const response = await api.get(`/qr-codes/${qrIdToLoad}`)
          console.log('📦 API response:', response.data)
          const qr = response.data.qrCode
          if (qr) {
            const settings = JSON.parse(qr.settings)
            console.log('📥 Loading QR code:', { 
              qrId: qr.id, 
              name: qr.name, 
              type: qr.type,
              form: settings.form,
              logoPreset: settings.design?.logoPreset, 
              hasLogoUpload: !!settings.design?.logoUpload 
            })
            
            setQrName(qr.name)
            setCurrentQrId(qr.id)
            setType(qr.type)
            setForm({ ...DEFAULT_FORM, ...settings.form })
            
            console.log('✅ Form data merged:', { ...DEFAULT_FORM, ...settings.form })
            
            if (settings.design) {
              console.log('🎨 Applying design settings...')
              setFramePreset(settings.design.framePreset || 'scan')
              setFramePhrase(settings.design.framePhrase || 'SCAN ME')
              setPhraseFont(settings.design.phraseFont || 'Sans-Serif')
              setFrameColor(settings.design.frameColor || '#000000')
              setDotStyle(settings.design.dotStyle || 'rounded')
              setCornerStyle(settings.design.cornerStyle || 'square')
              setCenterStyle(settings.design.centerStyle || 'square')
              setBackgroundColor(settings.design.backgroundColor || '#FFFFFF')
              setShapeColor(settings.design.shapeColor || '#000000')
              setBorderColor(settings.design.borderColor || '#000000')
              setCenterColor(settings.design.centerColor || '#000000')
              setTransparentBackground(settings.design.transparentBackground || false)
              setGradientEnabled(settings.design.gradientEnabled || false)
              setLogoPreset(settings.design.logoPreset || 'none')
              setLogoUpload(settings.design.logoUpload || '')
              setLogoSize(settings.design.logoSize || 24)
              setExportResolution(settings.design.exportResolution || 2048)
              console.log('✅ Design settings applied')
            }
            console.log('✅ QR code loaded successfully')
            return
          }
        }
        
        console.log('ℹ️ No QR to load from gallery, checking old settings...')
        // Sinon, charger les derniers paramètres sauvegardés (ancienne méthode)
        const response = await api.get('/qr-settings/load')
        const settings = response?.data?.settings
        if (settings) {
          console.log('📥 Loading old settings:', settings)
          setType(settings.type || 'link')
          setForm({ ...DEFAULT_FORM, ...settings.form })
          if (settings.design) {
            setFramePreset(settings.design.framePreset || 'scan')
            setFramePhrase(settings.design.framePhrase || 'SCAN ME')
            setPhraseFont(settings.design.phraseFont || 'Sans-Serif')
            setFrameColor(settings.design.frameColor || '#000000')
            setDotStyle(settings.design.dotStyle || 'rounded')
            setCornerStyle(settings.design.cornerStyle || 'square')
            setCenterStyle(settings.design.centerStyle || 'square')
            setBackgroundColor(settings.design.backgroundColor || '#FFFFFF')
            setShapeColor(settings.design.shapeColor || '#000000')
            setBorderColor(settings.design.borderColor || '#000000')
            setCenterColor(settings.design.centerColor || '#000000')
            setTransparentBackground(settings.design.transparentBackground || false)
            setGradientEnabled(settings.design.gradientEnabled || false)
            setLogoPreset(settings.design.logoPreset || 'none')
            setLogoUpload(settings.design.logoUpload || '')
            setLogoSize(settings.design.logoSize || 24)
            setExportResolution(settings.design.exportResolution || 2048)
          }
        }
      } catch (error) {
        console.error('❌ Error loading QR code:', error)
      }
    }
    loadQr()
  }, [])

  // Effet supplémentaire : vérifier s'il y a un QR à charger quand la location change
  // Ceci est nécessaire car si l'utilisateur est déjà sur /apps/qr-code,
  // le composant ne se remonte pas et le useEffect ci-dessus ne se déclenche pas
  useEffect(() => {
    const checkForQrToLoad = async () => {
      const qrIdToLoad = localStorage.getItem('qr-to-load')
      if (qrIdToLoad) {
        console.log('🔄 Location changed, found qr-to-load:', qrIdToLoad)
        localStorage.removeItem('qr-to-load')
        try {
          const response = await api.get(`/qr-codes/${qrIdToLoad}`)
          const qr = response.data.qrCode
          if (qr) {
            const settings = JSON.parse(qr.settings)
            console.log('📥 Loading QR from location change:', { 
              qrId: qr.id, 
              name: qr.name, 
              type: qr.type,
              form: settings.form
            })
            
            setQrName(qr.name)
            setCurrentQrId(qr.id)
            setType(qr.type)
            setForm({ ...DEFAULT_FORM, ...settings.form })
            
            if (settings.design) {
              setFramePreset(settings.design.framePreset || 'scan')
              setFramePhrase(settings.design.framePhrase || 'SCAN ME')
              setPhraseFont(settings.design.phraseFont || 'Sans-Serif')
              setFrameColor(settings.design.frameColor || '#000000')
              setDotStyle(settings.design.dotStyle || 'rounded')
              setCornerStyle(settings.design.cornerStyle || 'square')
              setCenterStyle(settings.design.centerStyle || 'square')
              setBackgroundColor(settings.design.backgroundColor || '#FFFFFF')
              setShapeColor(settings.design.shapeColor || '#000000')
              setBorderColor(settings.design.borderColor || '#000000')
              setCenterColor(settings.design.centerColor || '#000000')
              setTransparentBackground(settings.design.transparentBackground || false)
              setGradientEnabled(settings.design.gradientEnabled || false)
              setLogoPreset(settings.design.logoPreset || 'none')
              setLogoUpload(settings.design.logoUpload || '')
              setLogoSize(settings.design.logoSize || 24)
              setExportResolution(settings.design.exportResolution || 2048)
            }
            console.log('✅ QR code loaded from location change')
          }
        } catch (error) {
          console.error('❌ Error loading QR from location change:', error)
        }
      }
    }
    checkForQrToLoad()
  }, [location])

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

                    <div className="mt-3">
                      <label className="form-label">Logo size: {logoSize}%</label>
                      <input
                        type="range"
                        className="form-range"
                        min="10"
                        max="45"
                        step="1"
                        value={logoSize}
                        onChange={(event) => setLogoSize(Number(event.target.value))}
                      />
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

              <div className="mt-3">
                <label className="form-label mb-1">Nom du QR Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Menu Restaurant"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                />
              </div>

              <button type="button" className="btn btn-primary mt-2" onClick={saveQrSettings}>
                <i className="feather-save me-2"></i>
                {currentQrId ? 'Mettre à jour' : 'Sauvegarder sur le site'}
              </button>

              <Link to="/apps/my-qr-codes" className="btn btn-light mt-2">
                <i className="feather-grid me-2"></i>
                Mes QR Codes
              </Link>

              <div className="mt-3">
                <label className="form-label mb-1">Final resolution</label>
                <select className="form-select" value={exportResolution} onChange={(event) => setExportResolution(Number(event.target.value))}>
                  <option value={1024}>1024 x 1024</option>
                  <option value={2048}>2048 x 2048</option>
                  <option value={3072}>3072 x 3072</option>
                  <option value={4096}>4096 x 4096</option>
                </select>
                <small className="text-muted">Higher resolution = larger file size.</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde (demander un nom) */}
      {showSaveModal && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sauvegarder le QR Code</h5>
                  <button type="button" className="btn-close" onClick={() => setShowSaveModal(false)}></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Nom du QR Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Menu Restaurant"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveWithName()}
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                    Annuler
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveWithName}>
                    Sauvegarder
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
