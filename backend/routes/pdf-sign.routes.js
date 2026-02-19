import express from 'express'
import multer from 'multer'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import forge from 'node-forge'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import eidService from '../services/eid-service.js'
import itsmeService from '../services/itsme-service.js'
import csamService from '../services/csam-service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

// Configuration multer pour upload temporaire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
})

/**
 * @route POST /api/pdf-sign/digital-sign
 * @desc Signer électroniquement un PDF avec certificat
 * @access Public (à sécuriser selon vos besoins)
 */
router.post('/digital-sign', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files?.pdf) {
      return res.status(400).json({ error: 'Fichier PDF requis' })
    }

    // Récupérer le PDF
    const pdfBuffer = req.files.pdf[0].buffer

    // Méthode de signature
    const signMethod = req.body.signMethod // 'certificate', 'eid', 'itsme', 'csam'
    
    let certificateBuffer
    let certificatePassword = req.body.certificatePassword || ''

    // Gestion selon la méthode
    switch (signMethod) {
      case 'certificate':
        // Certificat uploadé directement
        if (!req.files?.certificate) {
          return res.status(400).json({ error: 'Certificat requis pour cette méthode' })
        }
        certificateBuffer = req.files.certificate[0].buffer
        break

      case 'eid':
        // Signature avec carte eID belge
        const eidPin = req.body.eidPin
        if (!eidPin) {
          return res.status(400).json({ error: 'Code PIN eID requis' })
        }
        
        try {
          const eidResult = await eidService.signPdfWithEid(
            pdfBuffer,
            {
              name: req.body.name,
              reason: req.body.reason
            },
            eidPin
          )
          
          certificateBuffer = eidResult.certificate
          // Note: eidResult.signature contient la signature cryptographique
          // À intégrer dans le PDF avec la méthode appropriée
        } catch (error) {
          return res.status(500).json({ 
            error: 'Erreur signature eID',
            message: error.message
          })
        }
        break

      case 'itsme':
        // Signature avec itsme®
        const itsmeCode = req.body.authCode
        if (!itsmeCode) {
          return res.status(400).json({ 
            error: 'Code d\'autorisation itsme requis',
            message: 'Complétez d\'abord le flow OAuth2 itsme'
          })
        }
        
        try {
          const itsmeResult = await itsmeService.signPdfWithItsme(
            pdfBuffer,
            {
              name: req.body.name || req.files.pdf[0].originalname,
              description: req.body.reason || 'Signature électronique',
              reason: req.body.reason,
              location: 'Belgium'
            },
            itsmeCode
          )
          
          certificateBuffer = itsmeResult.certificate
        } catch (error) {
          return res.status(500).json({ 
            error: 'Erreur signature itsme',
            message: error.message
          })
        }
        break

      case 'csam':
        // Signature avec CSAM (MyGov.be)
        const csamCode = req.body.authCode
        if (!csamCode) {
          return res.status(400).json({ 
            error: 'Code d\'autorisation CSAM requis',
            message: 'Complétez d\'abord le flow OAuth2 CSAM'
          })
        }
        
        try {
          const csamResult = await csamService.signPdfWithCsam(
            pdfBuffer,
            {
              name: req.files.pdf[0].originalname,
              description: req.body.reason || 'Signature électronique',
              reason: req.body.reason,
              location: 'Belgium',
              contactInfo: req.body.contactInfo
            },
            csamCode
          )
          
          certificateBuffer = csamResult.certificate
        } catch (error) {
          return res.status(500).json({ 
            error: 'Erreur signature CSAM',
            message: error.message
          })
        }
        break

      default:
        return res.status(400).json({ error: 'Méthode de signature non valide' })
    }

    // Charger le PDF avec pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      updateMetadata: false 
    })
    
    // Extraire les infos du certificat P12
    let certInfo = {
      commonName: req.body.name || 'Signataire',
      organization: '',
      signDate: new Date().toLocaleString('fr-BE')
    }
    
    try {
      // Lire le certificat P12 pour extraire les informations
      const p12Der = forge.util.decode64(certificateBuffer.toString('base64'))
      const p12Asn1 = forge.asn1.fromDer(p12Der)
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certificatePassword)
      
      // Extraire le certificat
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })
      const certBag = certBags[forge.pki.oids.certBag][0]
      
      if (certBag && certBag.cert) {
        const cert = certBag.cert
        const subject = cert.subject.attributes
        
        certInfo.commonName = subject.find(attr => attr.name === 'commonName')?.value || certInfo.commonName
        certInfo.organization = subject.find(attr => attr.name === 'organizationName')?.value || ''
      }
    } catch (err) {
      console.log('Impossible d\'extraire les infos du certificat, utilisation des valeurs par défaut')
    }
    
    // Récupérer les coordonnées de signature si fournies
    const hasCustomPosition = req.body.signatureX !== undefined && 
                              req.body.signatureY !== undefined && 
                              req.body.signaturePage !== undefined
    
    let targetPage, stampX, stampY, stampWidth, stampHeight
    const pages = pdfDoc.getPages()
    
    if (hasCustomPosition) {
      // Utiliser la position personnalisée
      const pageIndex = parseInt(req.body.signaturePage)
      targetPage = pages[pageIndex]
      const { height } = targetPage.getSize()
      
      stampX = parseFloat(req.body.signatureX)
      stampY = height - parseFloat(req.body.signatureY) - parseFloat(req.body.signatureHeight) // Inverser Y pour pdf-lib
      stampWidth = parseFloat(req.body.signatureWidth)
      stampHeight = parseFloat(req.body.signatureHeight)
    } else {
      // Position par défaut: en bas à droite de la dernière page
      targetPage = pages[pages.length - 1]
      const { width, height } = targetPage.getSize()
      stampWidth = 250
      stampHeight = 100
      stampX = width - stampWidth - 50
      stampY = 50
    }
    
    // Charger la police
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Dessiner le tampon de signature
    // Fond du tampon
    targetPage.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampWidth,
      height: stampHeight,
      borderColor: rgb(0, 0, 0.5),
      borderWidth: 1.5,
      color: rgb(0.95, 0.95, 1)
    })
    
    // Titre
    targetPage.drawText('SIGNÉ ÉLECTRONIQUEMENT', {
      x: stampX + 10,
      y: stampY + stampHeight - 20,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0.5)
    })
    
    // Signataire
    targetPage.drawText(`Signataire: ${certInfo.commonName}`, {
      x: stampX + 10,
      y: stampY + stampHeight - 40,
      size: 9,
      font: font,
      color: rgb(0, 0, 0)
    })
    
    // Organisation
    if (certInfo.organization) {
      targetPage.drawText(`Organisation: ${certInfo.organization}`, {
        x: stampX + 10,
        y: stampY + stampHeight - 55,
        size: 8,
        font: font,
        color: rgb(0.3, 0.3, 0.3)
      })
    }
    
    // Raison
    targetPage.drawText(`Raison: ${req.body.reason || 'Signature électronique'}`, {
      x: stampX + 10,
      y: stampY + stampHeight - 70,
      size: 8,
      font: font,
      color: rgb(0.3, 0.3, 0.3)
    })
    
    // Date
    targetPage.drawText(`Date: ${certInfo.signDate}`, {
      x: stampX + 10,
      y: stampY + 10,
      size: 7,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    })
    
    // Ajouter les métadonnées de signature
    pdfDoc.setTitle('Document Signé Électroniquement')
    pdfDoc.setSubject(`Signé par: ${certInfo.commonName}`)
    pdfDoc.setProducer('MACCAM CRM - Signature Électronique')
    pdfDoc.setCreator('MACCAM CRM')
    pdfDoc.setKeywords([
      'Signature électronique',
      certInfo.commonName,
      req.body.reason || 'Signature',
      certInfo.signDate
    ])
    
    // Sauvegarder le PDF signé
    const signedPdfBuffer = await pdfDoc.save()

    // Retourner le PDF signé
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="signed-${req.files.pdf[0].originalname}"`)
    res.send(Buffer.from(signedPdfBuffer))

  } catch (error) {
    console.error('Erreur signature PDF:', error)
    res.status(500).json({ 
      error: 'Erreur lors de la signature du PDF',
      details: error.message 
    })
  }
})

/**
 * @route GET /api/pdf-sign/methods
 * @desc Obtenir les méthodes de signature disponibles
 * @access Public
 */
router.get('/methods', async (req, res) => {
  // Vérifier la disponibilité des services
  const eidAvailable = await eidService.checkMiddlewareAvailable().catch(() => false)
  const itsmeConfigured = itsmeService.isConfigured()
  const csamConfigured = csamService.isConfigured()

  res.json({
    methods: [
      {
        id: 'certificate',
        name: 'Certificat P12/PFX',
        description: 'Signer avec un certificat personnel (fichier .p12 ou .pfx)',
        available: true,
        requiresPassword: true,
        requiresCertificate: true,
        icon: 'feather-lock'
      },
      {
        id: 'eid',
        name: 'Carte eID',
        description: 'Signer avec votre carte d\'identité électronique belge',
        available: eidAvailable,
        requiresMiddleware: true,
        requiresPin: true,
        middleware: 'Belgium eID Middleware',
        downloadUrl: 'https://eid.belgium.be/fr/telecharger-le-logiciel-eid',
        icon: 'feather-credit-card'
      },
      {
        id: 'itsme',
        name: 'itsme®',
        description: 'Signer avec l\'application mobile itsme',
        available: itsmeConfigured,
        requiresAccount: true,
        requiresOAuth: true,
        setupUrl: 'https://www.itsme.be/',
        icon: 'feather-smartphone'
      },
      {
        id: 'csam',
        name: 'MyGov.be / CSAM',
        description: 'Signer avec votre compte citoyen MyGov.be',
        available: csamConfigured,
        requiresAccount: true,
        requiresOAuth: true,
        setupUrl: 'https://www.mygovid.be/',
        icon: 'feather-shield'
      }
    ]
  })
})

/**
 * @route POST /api/pdf-sign/create-demo-certificate
 * @desc Créer un certificat de démonstration (auto-signé)
 * @access Public (à sécuriser en production)
 */
router.post('/create-demo-certificate', async (req, res) => {
  try {
    const forge = (await import('node-forge')).default

    // Créer une paire de clés
    const keys = forge.pki.rsa.generateKeyPair(2048)

    // Créer un certificat auto-signé
    const cert = forge.pki.createCertificate()
    cert.publicKey = keys.publicKey
    cert.serialNumber = '01'
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

    const attrs = [
      { name: 'commonName', value: req.body.name || 'Demo User' },
      { name: 'countryName', value: req.body.country || 'BE' },
      { name: 'organizationName', value: req.body.organization || 'Demo Org' },
      { shortName: 'ST', value: req.body.state || 'Brussels' },
      { name: 'localityName', value: req.body.city || 'Brussels' }
    ]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.sign(keys.privateKey, forge.md.sha256.create())

    // Créer le fichier P12
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey,
      cert,
      req.body.password || 'demo',
      {
        algorithm: '3des'
      }
    )

    const p12Der = forge.asn1.toDer(p12Asn1).getBytes()
    const p12Buffer = Buffer.from(p12Der, 'binary')

    res.setHeader('Content-Type', 'application/x-pkcs12')
    res.setHeader('Content-Disposition', 'attachment; filename="demo-certificate.p12"')
    res.send(p12Buffer)

  } catch (error) {
    console.error('Erreur création certificat:', error)
    res.status(500).json({ 
      error: 'Erreur lors de la création du certificat',
      details: error.message 
    })
  }
})

/**
 * @route GET /api/pdf-sign/demo-certificate
 * @desc Télécharger le certificat de démonstration
 * @access Public
 */
router.get('/demo-certificate', (req, res) => {
  try {
    const certPath = path.join(__dirname, '..', 'demo-certificate.p12')
    
    if (!fs.existsSync(certPath)) {
      return res.status(404).json({ 
        error: 'Certificat de démonstration non trouvé',
        message: 'Exécutez "node create-demo-cert.js" pour créer le certificat'
      })
    }

    res.setHeader('Content-Type', 'application/x-pkcs12')
    res.setHeader('Content-Disposition', 'attachment; filename="demo-certificate.p12"')
    res.sendFile(certPath)
  } catch (error) {
    console.error('Erreur téléchargement certificat:', error)
    res.status(500).json({ error: 'Erreur lors du téléchargement du certificat' })
  }
})

/**
 * @route GET /api/pdf-sign/itsme/authorize
 * @desc Initier le flow OAuth2 itsme
 * @access Public
 */
router.get('/itsme/authorize', (req, res) => {
  try {
    if (!itsmeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'itsme non configuré',
        message: 'Configurez ITSME_CLIENT_ID et ITSME_CLIENT_SECRET dans .env'
      })
    }

    const state = crypto.randomBytes(16).toString('hex')
    const documentHash = req.query.documentHash || ''
    
    // Stocker le state en session (à implémenter avec Redis en production)
    req.session = req.session || {}
    req.session.itsmeState = state
    req.session.documentHash = documentHash
    
    const authUrl = itsmeService.generateAuthorizationUrl(state, documentHash)
    res.json({ authUrl })
  } catch (error) {
    console.error('Erreur autorisation itsme:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * @route GET /api/pdf-sign/itsme/callback
 * @desc Callback OAuth2 itsme
 * @access Public
 */
router.get('/itsme/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query
    
    if (error) {
      return res.redirect(`/apps/pdf-tools/sign-pdf?error=itsme_${error}`)
    }
    
    // Vérifier le state (protection CSRF)
    if (state !== req.session?.itsmeState) {
      return res.redirect('/apps/pdf-tools/sign-pdf?error=invalid_state')
    }
    
    // Rediriger vers le frontend avec le code
    res.redirect(`/apps/pdf-tools/sign-pdf?authCode=${code}&method=itsme`)
  } catch (error) {
    console.error('Erreur callback itsme:', error)
    res.redirect('/apps/pdf-tools/sign-pdf?error=callback_failed')
  }
})

/**
 * @route GET /api/pdf-sign/csam/authorize
 * @desc Initier le flow OAuth2 CSAM (MyGov.be)
 * @access Public
 */
router.get('/csam/authorize', (req, res) => {
  try {
    if (!csamService.isConfigured()) {
      return res.status(503).json({ 
        error: 'CSAM non configuré',
        message: 'Configurez CSAM_CLIENT_ID et CSAM_CLIENT_SECRET dans .env'
      })
    }

    const state = crypto.randomBytes(16).toString('hex')
    
    // Stocker le state en session
    req.session = req.session || {}
    req.session.csamState = state
    
    const authUrl = csamService.generateAuthorizationUrl(state)
    res.json({ authUrl })
  } catch (error) {
    console.error('Erreur autorisation CSAM:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * @route GET /api/pdf-sign/csam/callback
 * @desc Callback OAuth2 CSAM
 * @access Public
 */
router.get('/csam/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query
    
    if (error) {
      return res.redirect(`/apps/pdf-tools/sign-pdf?error=csam_${error}`)
    }
    
    // Vérifier le state
    if (state !== req.session?.csamState) {
      return res.redirect('/apps/pdf-tools/sign-pdf?error=invalid_state')
    }
    
    // Rediriger vers le frontend avec le code
    res.redirect(`/apps/pdf-tools/sign-pdf?authCode=${code}&method=csam`)
  } catch (error) {
    console.error('Erreur callback CSAM:', error)
    res.redirect('/apps/pdf-tools/sign-pdf?error=callback_failed')
  }
})

/**
 * @route POST /api/pdf-sign/eid/check
 * @desc Vérifier si le middleware eID est disponible et lire la carte
 * @access Public
 */
router.post('/eid/check', async (req, res) => {
  try {
    const middlewareOk = await eidService.checkMiddlewareAvailable()
    
    if (!middlewareOk) {
      return res.status(503).json({
        error: 'Middleware eID non disponible',
        message: 'Installez le middleware Belgium eID depuis eid.belgium.be',
        downloadUrl: 'https://eid.belgium.be/fr/télécharger-le-logiciel-eid'
      })
    }
    
    // Lire les infos de la carte
    const cardInfo = await eidService.readCardInfo()
    const certBuffer = await eidService.readSignatureCertificate()
    const certInfo = eidService.parseCertificate(certBuffer)
    
    res.json({
      available: true,
      card: cardInfo,
      certificate: certInfo
    })
  } catch (error) {
    console.error('Erreur vérification eID:', error)
    res.status(500).json({
      error: 'Erreur lecture carte eID',
      message: error.message
    })
  }
})

export default router
