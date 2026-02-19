/**
 * Service d'intégration avec CSAM (Citizen Signature Access Module)
 * Module de signature électronique du gouvernement belge via MyGov.be
 */

import crypto from 'crypto'
import jwt from 'jsonwebtoken'

class CsamService {
  constructor() {
    this.clientId = process.env.CSAM_CLIENT_ID
    this.clientSecret = process.env.CSAM_CLIENT_SECRET
    this.redirectUri = process.env.CSAM_REDIRECT_URI || 'http://localhost:5000/api/v1/pdf-sign/csam/callback'
    
    // URLs CSAM (production)
    this.authorizeUrl = 'https://iamapps.belgium.be/oauth2/authorize'
    this.tokenUrl = 'https://iamapps.belgium.be/oauth2/token'
    this.signatureUrl = 'https://sign.csam.belgium.be/v1/signature'
    this.certificateUrl = 'https://sign.csam.belgium.be/v1/certificate'
    
    // Pour tests: environnement acceptance
    if (process.env.CSAM_ENV === 'acceptance') {
      this.authorizeUrl = 'https://iamapps-acc.belgium.be/oauth2/authorize'
      this.tokenUrl = 'https://iamapps-acc.belgium.be/oauth2/token'
      this.signatureUrl = 'https://sign-acc.csam.belgium.be/v1/signature'
      this.certificateUrl = 'https://sign-acc.csam.belgium.be/v1/certificate'
    }
  }

  /**
   * Vérifie que CSAM est configuré
   */
  isConfigured() {
    return this.clientId && this.clientSecret
  }

  /**
   * Génère l'URL d'autorisation OAuth2 pour CSAM/MyGov
   */
  generateAuthorizationUrl(state, scope = 'openid profile signature') {
    if (!this.isConfigured()) {
      throw new Error('CSAM non configuré. Ajoutez CSAM_CLIENT_ID et CSAM_CLIENT_SECRET')
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scope,
      state: state,
      // Paramètres spécifiques à CSAM
      acr_values: 'urn:be:fedict:iam:fas:Level500', // Niveau d'authentification requis
      ui_locales: 'fr' // Langue interface
    })

    return `${this.authorizeUrl}?${params.toString()}`
  }

  /**
   * Échange le code d'autorisation contre un access token
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Erreur token CSAM: ${error.error_description || error.error}`)
      }

      const tokenData = await response.json()
      
      // Décoder le ID token pour obtenir les infos utilisateur
      const idToken = jwt.decode(tokenData.id_token)
      
      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
        userInfo: {
          sub: idToken.sub,
          name: idToken.name,
          givenName: idToken.given_name,
          familyName: idToken.family_name,
          nationalNumber: idToken['urn:be:fedict:iam:claim:nationalRegisterNumber'],
          email: idToken.email
        }
      }
    } catch (error) {
      throw new Error(`Échec échange token CSAM: ${error.message}`)
    }
  }

  /**
   * Récupère le certificat de signature de l'utilisateur
   */
  async getUserCertificate(accessToken) {
    try {
      const response = await fetch(this.certificateUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/x-x509-user-cert'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur récupération certificat: ${response.status}`)
      }

      const certBuffer = await response.arrayBuffer()
      return Buffer.from(certBuffer)
    } catch (error) {
      throw new Error(`Erreur certificat CSAM: ${error.message}`)
    }
  }

  /**
   * Crée une demande de signature
   */
  async createSignatureRequest(accessToken, documentData) {
    try {
      const response = await fetch(this.signatureUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          document: {
            name: documentData.name,
            description: documentData.description,
            hash: documentData.hash,
            hash_algorithm: 'SHA256',
            mime_type: 'application/pdf'
          },
          signature: {
            type: 'PADES', // PDF Advanced Electronic Signature
            level: 'ADVANCED', // ou QUALIFIED
            reason: documentData.reason,
            location: documentData.location || 'Belgium',
            contact_info: documentData.contactInfo
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Erreur création signature: ${error.message || response.statusText}`)
      }

      const result = await response.json()
      return {
        requestId: result.request_id,
        status: result.status, // PENDING, WAITING_USER_ACTION, etc.
        expiresAt: result.expires_at
      }
    } catch (error) {
      throw new Error(`Échec création demande signature: ${error.message}`)
    }
  }

  /**
   * Récupère le statut d'une demande de signature
   */
  async getSignatureStatus(accessToken, requestId) {
    try {
      const response = await fetch(`${this.signatureUrl}/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur statut signature: ${response.status}`)
      }

      const status = await response.json()
      return {
        status: status.status, // PENDING, SIGNED, REJECTED, EXPIRED, ERROR
        signature: status.signature ? Buffer.from(status.signature, 'base64') : null,
        signedAt: status.signed_at,
        errorMessage: status.error_message
      }
    } catch (error) {
      throw new Error(`Erreur récupération statut: ${error.message}`)
    }
  }

  /**
   * Récupère la signature complétée
   */
  async retrieveSignature(accessToken, requestId) {
    try {
      const response = await fetch(`${this.signatureUrl}/${requestId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/octet-stream'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur téléchargement signature: ${response.status}`)
      }

      const signatureBuffer = await response.arrayBuffer()
      return Buffer.from(signatureBuffer)
    } catch (error) {
      throw new Error(`Erreur récupération signature: ${error.message}`)
    }
  }

  /**
   * Processus complet de signature avec CSAM
   */
  async signPdfWithCsam(pdfBuffer, documentMetadata, authorizationCode) {
    if (!this.isConfigured()) {
      throw new Error('CSAM non configuré')
    }

    // 1. Échanger le code contre un access token
    const tokenData = await this.exchangeCodeForToken(authorizationCode)
    const accessToken = tokenData.accessToken
    const userInfo = tokenData.userInfo

    console.log('Utilisateur CSAM authentifié:', userInfo.name)

    // 2. Calculer le hash du document
    const hash = crypto.createHash('sha256')
    hash.update(pdfBuffer)
    const documentHash = hash.digest('hex')

    // 3. Créer la demande de signature
    const signatureRequest = await this.createSignatureRequest(accessToken, {
      name: documentMetadata.name,
      description: documentMetadata.description || 'Document PDF',
      hash: documentHash,
      reason: documentMetadata.reason || 'Signature électronique',
      location: documentMetadata.location || 'Belgium',
      contactInfo: documentMetadata.contactInfo
    })

    console.log('Demande de signature créée:', signatureRequest.requestId)

    // 4. Attendre que l'utilisateur signe (polling ou webhook)
    // Dans une vraie implémentation, ceci serait asynchrone
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max (polling chaque 5 secondes)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Attendre 5 secondes
      
      const status = await this.getSignatureStatus(accessToken, signatureRequest.requestId)
      
      if (status.status === 'SIGNED') {
        console.log('Document signé avec succès!')
        const signature = await this.retrieveSignature(accessToken, signatureRequest.requestId)
        
        return {
          signature: signature,
          certificate: await this.getUserCertificate(accessToken),
          signerInfo: {
            name: userInfo.name,
            nationalNumber: userInfo.nationalNumber,
            email: userInfo.email,
            requestId: signatureRequest.requestId,
            signedAt: status.signedAt
          }
        }
      } else if (status.status === 'REJECTED') {
        throw new Error('Signature refusée par l\'utilisateur')
      } else if (status.status === 'EXPIRED') {
        throw new Error('Demande de signature expirée')
      } else if (status.status === 'ERROR') {
        throw new Error(`Erreur signature: ${status.errorMessage}`)
      }
      
      attempts++
    }

    throw new Error('Timeout: signature non complétée dans le délai imparti')
  }

  /**
   * Annule une demande de signature en attente
   */
  async cancelSignatureRequest(accessToken, requestId) {
    try {
      const response = await fetch(`${this.signatureUrl}/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      return response.ok
    } catch (error) {
      console.error('Erreur annulation signature:', error)
      return false
    }
  }
}

export default new CsamService()
