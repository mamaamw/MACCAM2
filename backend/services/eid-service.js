/**
 * Service d'intégration avec Belgium eID
 * Gère la signature électronique avec la carte d'identité belge
 */

import forge from 'node-forge'

class EidService {
  constructor() {
    this.middlewareUrl = process.env.EID_MIDDLEWARE_URL || 'http://localhost:15051'
  }

  /**
   * Vérifie si le middleware eID est installé et accessible
   */
  async checkMiddlewareAvailable() {
    try {
      const response = await fetch(`${this.middlewareUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      return response.ok
    } catch (error) {
      console.error('Middleware eID non accessible:', error.message)
      return false
    }
  }

  /**
   * Lit les informations de la carte eID
   */
  async readCardInfo() {
    try {
      const response = await fetch(`${this.middlewareUrl}/card/info`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Erreur lecture carte: ${response.status}`)
      }

      const cardInfo = await response.json()
      return {
        cardNumber: cardInfo.cardNumber,
        firstName: cardInfo.firstName,
        lastName: cardInfo.lastName,
        fullName: `${cardInfo.firstName} ${cardInfo.lastName}`,
        dateOfBirth: cardInfo.dateOfBirth,
        nationalNumber: cardInfo.nationalNumber,
        expiryDate: cardInfo.expiryDate
      }
    } catch (error) {
      throw new Error(`Impossible de lire la carte eID: ${error.message}`)
    }
  }

  /**
   * Lit le certificat de signature depuis la carte eID
   */
  async readSignatureCertificate() {
    try {
      const response = await fetch(`${this.middlewareUrl}/card/certificate/signature`, {
        method: 'GET',
        headers: { 'Accept': 'application/x-x509-user-cert' }
      })

      if (!response.ok) {
        throw new Error(`Erreur lecture certificat: ${response.status}`)
      }

      const certBuffer = await response.arrayBuffer()
      return Buffer.from(certBuffer)
    } catch (error) {
      throw new Error(`Impossible de lire le certificat: ${error.message}`)
    }
  }

  /**
   * Extrait les informations du certificat X.509
   */
  parseCertificate(certBuffer) {
    try {
      const certDer = forge.util.createBuffer(certBuffer)
      const asn1 = forge.asn1.fromDer(certDer)
      const cert = forge.pki.certificateFromAsn1(asn1)

      const subject = cert.subject.attributes
      const issuer = cert.issuer.attributes

      return {
        commonName: subject.find(attr => attr.name === 'commonName')?.value || '',
        serialNumber: subject.find(attr => attr.name === 'serialNumber')?.value || '',
        organization: subject.find(attr => attr.name === 'organizationName')?.value || '',
        country: subject.find(attr => attr.name === 'countryName')?.value || '',
        issuerCN: issuer.find(attr => attr.name === 'commonName')?.value || '',
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        fingerprint: forge.md.sha256.create().update(forge.asn1.toDer(asn1).getBytes()).digest().toHex()
      }
    } catch (error) {
      throw new Error(`Erreur analyse certificat: ${error.message}`)
    }
  }

  /**
   * Demande à l'utilisateur d'entrer son code PIN
   * et signe le PDF avec la clé privée de la carte
   */
  async signWithCard(pdfHash, pin) {
    try {
      const response = await fetch(`${this.middlewareUrl}/card/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          hashToSign: pdfHash.toString('base64'),
          hashAlgorithm: 'SHA256',
          pin: pin
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.code === 'PIN_INCORRECT') {
          throw new Error('Code PIN incorrect')
        } else if (error.code === 'PIN_BLOCKED') {
          throw new Error('Carte bloquée - contactez votre commune')
        }
        throw new Error(`Erreur signature: ${error.message}`)
      }

      const result = await response.json()
      return Buffer.from(result.signature, 'base64')
    } catch (error) {
      throw new Error(`Signature avec carte échouée: ${error.message}`)
    }
  }

  /**
   * Processus complet de signature avec eID
   */
  async signPdfWithEid(pdfBuffer, signerInfo, pin) {
    // 1. Vérifier que le middleware est disponible
    const middlewareOk = await this.checkMiddlewareAvailable()
    if (!middlewareOk) {
      throw new Error('Middleware Belgium eID non disponible. Installez-le depuis eid.belgium.be')
    }

    // 2. Lire les informations de la carte
    const cardInfo = await this.readCardInfo()
    console.log('Carte eID détectée:', cardInfo.fullName)

    // 3. Lire le certificat de signature
    const certBuffer = await this.readSignatureCertificate()
    const certInfo = this.parseCertificate(certBuffer)
    console.log('Certificat valide jusqu\'au:', certInfo.validTo)

    // 4. Calculer le hash du PDF
    const hash = forge.md.sha256.create()
    hash.update(pdfBuffer.toString('binary'))
    const pdfHash = Buffer.from(hash.digest().bytes(), 'binary')

    // 5. Signer avec la carte (nécessite le PIN)
    const signature = await this.signWithCard(pdfHash, pin)

    return {
      signature,
      certificate: certBuffer,
      signerInfo: {
        name: cardInfo.fullName,
        nationalNumber: cardInfo.nationalNumber,
        ...certInfo
      }
    }
  }
}

export default new EidService()
