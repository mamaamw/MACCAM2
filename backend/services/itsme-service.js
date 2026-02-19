/**
 * Service d'intégration avec itsme®
 * Gère la signature électronique via l'application mobile itsme®
 */

import crypto from 'crypto'

class ItsmeService {
  constructor() {
    this.clientId = process.env.ITSME_CLIENT_ID
    this.clientSecret = process.env.ITSME_CLIENT_SECRET
    this.redirectUri = process.env.ITSME_REDIRECT_URI || 'http://localhost:5000/api/v1/pdf-sign/itsme/callback'
    
    // URLs itsme (production)
    this.authorizeUrl = 'https://idp.prd.itsme.services/v2/authorization'
    this.tokenUrl = 'https://idp.prd.itsme.services/v2/token'
    this.userInfoUrl = 'https://idp.prd.itsme.services/v2/userinfo'
    this.signUrl = 'https://sign.prd.itsme.services/v1/sign'
    
    // Pour tests: utiliser l'environnement sandbox
    if (process.env.ITSME_ENV === 'sandbox') {
      this.authorizeUrl = 'https://idp.e2e.itsme.services/v2/authorization'
      this.tokenUrl = 'https://idp.e2e.itsme.services/v2/token'
      this.userInfoUrl = 'https://idp.e2e.itsme.services/v2/userinfo'
      this.signUrl = 'https://sign.e2e.itsme.services/v1/sign'
    }
  }

  /**
   * Vérifie que les credentials itsme sont configurés
   */
  isConfigured() {
    return this.clientId && this.clientSecret
  }

  /**
   * Génère l'URL d'autorisation OAuth2 pour itsme
   */
  generateAuthorizationUrl(state, documentHash) {
    if (!this.isConfigured()) {
      throw new Error('itsme® non configuré. Ajoutez ITSME_CLIENT_ID et ITSME_CLIENT_SECRET')
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email eid signature',
      state: state,
      // Paramètres spécifiques pour la signature
      acr_values: 'http://itsme.services/v2/claim/acr_advanced',
      // Hash du document à signer
      login_hint: `doc_hash:${documentHash}`
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
        throw new Error(`Erreur token itsme: ${error.error_description || error.error}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Échec échange token itsme: ${error.message}`)
    }
  }

  /**
   * Récupère les informations de l'utilisateur itsme
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch(this.userInfoUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur UserInfo: ${response.status}`)
      }

      const userInfo = await response.json()
      return {
        sub: userInfo.sub, // Identifiant unique itsme
        name: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        email: userInfo.email,
        birthdate: userInfo.birthdate,
        nationalRegisterNumber: userInfo['http://itsme.services/v2/claim/BENationalNumber']
      }
    } catch (error) {
      throw new Error(`Erreur récupération UserInfo: ${error.message}`)
    }
  }

  /**
   * Demande une signature électronique qualifiée via itsme
   */
  async requestSignature(accessToken, documentHash, documentMetadata) {
    try {
      const response = await fetch(this.signUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          document: {
            hash: documentHash,
            hash_algorithm: 'SHA256',
            name: documentMetadata.name,
            description: documentMetadata.description
          },
          signature_type: 'ADVANCED', // ou QUALIFIED pour signature qualifiée
          signature_format: 'PAdES', // PDF Advanced Electronic Signature
          reason: documentMetadata.reason,
          location: documentMetadata.location
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Erreur signature itsme: ${error.error_description || error.error}`)
      }

      const result = await response.json()
      return {
        signatureId: result.signature_id,
        signature: Buffer.from(result.signature, 'base64'),
        certificate: Buffer.from(result.certificate, 'base64'),
        timestamp: result.timestamp
      }
    } catch (error) {
      throw new Error(`Échec signature itsme: ${error.message}`)
    }
  }

  /**
   * Processus complet de signature avec itsme
   */
  async signPdfWithItsme(pdfBuffer, documentMetadata, authorizationCode) {
    if (!this.isConfigured()) {
      throw new Error('itsme® non configuré')
    }

    // 1. Échanger le code contre un access token
    const tokenData = await this.exchangeCodeForToken(authorizationCode)
    const accessToken = tokenData.access_token

    // 2. Récupérer les infos utilisateur
    const userInfo = await this.getUserInfo(accessToken)
    console.log('Utilisateur itsme authentifié:', userInfo.name)

    // 3. Calculer le hash du document
    const hash = crypto.createHash('sha256')
    hash.update(pdfBuffer)
    const documentHash = hash.digest('base64')

    // 4. Demander la signature
    const signatureResult = await this.requestSignature(
      accessToken,
      documentHash,
      documentMetadata
    )

    return {
      signature: signatureResult.signature,
      certificate: signatureResult.certificate,
      signerInfo: {
        name: userInfo.name,
        email: userInfo.email,
        nationalNumber: userInfo.nationalRegisterNumber,
        signatureId: signatureResult.signatureId,
        timestamp: signatureResult.timestamp
      }
    }
  }

  /**
   * Vérifie le statut d'une signature itsme
   */
  async checkSignatureStatus(signatureId, accessToken) {
    try {
      const response = await fetch(`${this.signUrl}/${signatureId}`, {
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
        status: status.status, // PENDING, SIGNED, REJECTED, EXPIRED
        signedAt: status.signed_at,
        expiresAt: status.expires_at
      }
    } catch (error) {
      throw new Error(`Erreur vérification statut: ${error.message}`)
    }
  }
}

export default new ItsmeService()
