# Guide d'intégration - Signature Électronique
## eID, itsme® et CSAM (MyGov.be)

Ce document explique comment configurer et utiliser les différentes méthodes de signature électronique dans MACCAM CRM.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Carte eID Belge](#carte-eid-belge)
3. [itsme®](#itsme)
4. [CSAM / MyGov.be](#csam--mygovbe)
5. [Comparaison des méthodes](#comparaison-des-méthodes)
6. [Dépannage](#dépannage)

---

## Vue d'ensemble

MACCAM CRM supporte 4 méthodes de signature électronique :

| Méthode | Type | Niveau | Cas d'usage |
|---------|------|--------|-------------|
| **Certificat P12/PFX** | Fichier | Simple | Tests, développement |
| **Carte eID** | Carte à puce | Avancé | Citoyens belges, signatures officielles |
| **itsme®** | Mobile | Avancé/Qualifié | Signature mobile, grand public |
| **CSAM/MyGov** | OAuth2 | Qualifié | Administration publique, eGovernment |

---

## Carte eID Belge

### Prérequis

#### 1. Middleware Belgium eID

**Téléchargement :**
- Windows : https://eid.belgium.be/fr/télécharger-le-logiciel-eid
- macOS : https://eid.belgium.be/fr/mac-os-x
- Linux : https://eid.belgium.be/fr/linux

**Installation :**
```bash
# Windows
Exécutez l'installateur téléchargé

# Ubuntu/Debian
sudo apt-get install eid-mw

# Fedora/RHEL
sudo dnf install eid-mw
```

#### 2. Lecteur de carte

- Lecteur de carte USB compatible PC/SC
- Cartes supportées : eID belge, diplômes électroniques belges

### Configuration Backend

Le middleware eID expose une API REST locale sur `http://localhost:15051`.

**Variables d'environnement (.env) :**
```ini
# Optionnel : URL custom du middleware
EID_MIDDLEWARE_URL=http://localhost:15051
```

### Utilisation

1. **Insérez votre carte eID** dans le lecteur
2. **Cliquez sur "Vérifier la carte eID"** dans l'interface
3. **Entrez votre code PIN** (4 chiffres)
4. **Placez** la signature sur le PDF si désiré
5. **Cliquez sur "Signer Électroniquement"**

### Architecture technique

```
Frontend → Backend → eID Middleware (localhost:15051)
                         ↓
                    Carte eID + Lecteur
```

**Flow de signature :**
1. `checkMiddlewareAvailable()` - Vérifier que le middleware est accessible
2. `readCardInfo()` - Lire les informations de la carte (nom, numéro national)
3. `readSignatureCertificate()` - Extraire le certificat de signature
4. `signWithCard(pdfHash, pin)` - Signer avec la clé privée de la carte

### Sécurité

- ✅ La clé privée **ne quitte jamais la carte**
- ✅ Le PIN est envoyé uniquement au middleware local (HTTPS recommandé)
- ✅ Signature conforme à la norme **PKCS#11**
- ⚠️ Blocage après 3 tentatives de PIN incorrectes

### Troubleshooting eID

**Erreur : "Middleware eID non disponible"**
```bash
# Vérifier que le service est démarré
# Windows
services.msc → Rechercher "Belgium eID"

# Linux
systemctl status pcscd
```

**Erreur : "Carte non détectée"**
- Vérifiez que le lecteur est connecté
- Réinsérez la carte
- Testez avec l'application Belgium eID Viewer

---

## itsme®

### Prérequis

#### 1. Compte Partenaire itsme

**Inscription :**
1. Visitez https://www.itsme.be/entreprises
2. Créez un compte partenaire
3. Complétez le processus KYC (Know Your Customer)
4. Attendez l'approbation (2-5 jours ouvrables)

#### 2. Configuration itsme Partner Portal

1. **Créez une nouvelle application** dans le portal
2. **Configurez les URLs de redirection :**
   ```
   http://localhost:5000/api/v1/pdf-sign/itsme/callback
   https://votredomaine.com/api/v1/pdf-sign/itsme/callback
   ```
3. **Activez les scopes nécessaires :**
   - `openid` - Authentification de base
   - `profile` - Informations profil
   - `email` - Adresse email
   - `eid` - Données carte eID
   - `signature` - Signature électronique

4. **Notez vos credentials :**
   - Client ID
   - Client Secret
   - Service Code (pour signature qualifiée)

### Configuration Backend

**Variables d'environnement (.env) :**
```ini
# Credentials itsme
ITSME_CLIENT_ID=your_client_id_here
ITSME_CLIENT_SECRET=your_client_secret_here
ITSME_REDIRECT_URI=http://localhost:5000/api/v1/pdf-sign/itsme/callback

# Environnement (sandbox pour tests, production pour production)
ITSME_ENV=sandbox  # ou 'production'
```

**URLs des environnements :**
- **Sandbox (tests)** : `https://idp.e2e.itsme.services`
- **Production** : `https://idp.prd.itsme.services`

### Utilisation

1. **Chargez un PDF** dans l'application
2. **Sélectionnez "itsme®"** comme méthode de signature
3. **Cliquez sur "Se connecter avec itsme®"**
4. **Scannez le QR code** avec l'application itsme sur votre smartphone
5. **Confirmez la signature** dans l'app itsme
6. **Retour automatique** vers l'application web
7. **Placez** la signature si désiré
8. **Cliquez sur "Signer Électroniquement"**

### Architecture technique

```
Frontend → Backend → API itsme (OAuth2)
                         ↓
                    App itsme Mobile
                         ↓
                    Serveurs itsme
```

**Flow OAuth2 + Signature :**
1. `generateAuthorizationUrl()` - Créer l'URL d'autorisation
2. Utilisateur authentifié via app mobile
3. `exchangeCodeForToken()` - Échanger le code contre un access token
4. `getUserInfo()` - Récupérer les informations utilisateur
5. `requestSignature()` - Demander une signature électronique
6. `checkSignatureStatus()` - Vérifier le statut (polling)
7. `retrieveSignature()` - Télécharger la signature complétée

### Types de signature itsme

| Type | Niveau | Usage | Coût |
|------|--------|-------|------|
| ADVANCED | eIDAS Avancé | Documents commerciaux | € |
| QUALIFIED | eIDAS Qualifié | Documents légaux | €€€ |

### Sécurité

- ✅ Authentification forte (2FA intégré)
- ✅ Signature conforme **eIDAS**
- ✅ Horodatage qualifié inclus
- ✅ Certificat X.509 fourni
- ⚠️ Requiert une connexion internet active

### Troubleshooting itsme

**Erreur : "itsme non configuré"**
- Vérifiez que `ITSME_CLIENT_ID` et `ITSME_CLIENT_SECRET` sont définis
- Assurez-vous d'avoir accès au Partner Portal

**Erreur : "invalid_redirect_uri"**
- Vérifiez que l'URL de callback est configurée dans le Partner Portal
- L'URL doit correspondre exactement (http vs https, port, etc.)

**Erreur : "Timeout: signature non complétée"**
- L'utilisateur n'a pas confirmé dans les 5 minutes
- Recommencez le processus

---

## CSAM / MyGov.be

### Prérequis

#### 1. Compte CSAM

**Inscription (Organismes publics) :**
1. Contactez BOSA (Service Public Fédéral) : https://www.bosa.belgium.be
2. Demandez un accès au CSAM (Citizen Signature Access Module)
3. Fournissez les informations de votre organisme
4. Signez le contrat CSAM

**Note :** CSAM est principalement destiné aux **administrations publiques** et **organismes parapublics** belges.

#### 2. Configuration IAM

1. **Enregistrez votre application** dans le IAM Portal
2. **Configurez les URLs de redirection :**
   ```
   http://localhost:5000/api/v1/pdf-sign/csam/callback
   https://votredomaine.gov.be/api/v1/pdf-sign/csam/callback
   ```
3. **Activez les scopes :**
   - `openid` - Authentification
   - `profile` - Profil citoyen
   - `signature` - Signature électronique qualifiée

### Configuration Backend

**Variables d'environnement (.env) :**
```ini
# Credentials CSAM
CSAM_CLIENT_ID=your_csam_client_id
CSAM_CLIENT_SECRET=your_csam_client_secret
CSAM_REDIRECT_URI=http://localhost:5000/api/v1/pdf-sign/csam/callback

# Environnement
CSAM_ENV=acceptance  # ou 'production'
```

**URLs des environnements :**
- **Acceptance (tests)** : `https://iamapps-acc.belgium.be`
- **Production** : `https://iamapps.belgium.be`

### Utilisation

1. **Chargez un PDF**
2. **Sélectionnez "MyGov.be / CSAM"**
3. **Cliquez sur "Se connecter avec MyGov.be"**
4. **Authentifiez-vous** avec :
   - Carte eID
   - itsme®
   - Token fédéral
5. **Confirmez la signature** sur la page CSAM
6. **Retour automatique** vers l'application
7. **Placez** la signature
8. **Cliquez sur "Signer Électroniquement"**

### Architecture technique

```
Frontend → Backend → IAM Portal (OAuth2)
                         ↓
                    Méthodes d'auth (eID/itsme/Token)
                         ↓
                    CSAM Signature Service
```

**Flow OAuth2 + Signature :**
1. `generateAuthorizationUrl()` - URL d'autorisation IAM
2. Utilisateur s'authentifie (eID/itsme/Token)
3. `exchangeCodeForToken()` - Échanger le code + obtenir ID token JWT  
4. `createSignatureRequest()` - Créer une demande de signature
5. `getSignatureStatus()` - Polling du statut
6. `retrieveSignature()` - Télécharger la signature PAdES

### Niveaux d'authentification CSAM

| Niveau | Description | Usage |
|--------|-------------|-------|
| Level100 | Faible | Non recommandé |
| Level200 | Substantiel | Documents internes |
| **Level500** | Élevé | **Documents officiels** |

### Sécurité

- ✅ Signature **qualifiée eIDAS**
- ✅ Conformité **GDPR**
- ✅ Audit trail complet
- ✅ Horodatage qualifié
- ✅ Certificats émis par **Certipost** ou **GlobalSign**
- ⚠️ Réservé aux organismes publics

### Troubleshooting CSAM

**Erreur : "CSAM non configuré"**
- CSAM n'est accessible que sur demande officielle
- Contactez BOSA pour obtenir un accès

**Erreur : "Demande de signature expirée"**
- La demande expire après 30 minutes d'inactivité
- Recommencez le processus

**Erreur : "Niveau d'authentification insuffisant"**
- Certains documents requièrent Level500
- Utilisez eID ou itsme (pas username/password)

---

## Comparaison des méthodes

### Critères de choix

| Critère | Certificat | eID | itsme® | CSAM |
|---------|-----------|-----|--------|------|
| **Facilité d'installation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Coût** | Gratuit | Gratuit | €-€€€ | Gratuit (admin) |
| **Niveau eIDAS** | Aucun | Avancé | Avancé/Qualifié | Qualifié |
| **Mobilité** | ❌ | ❌ | ✅ | ⚠️ |
| **Valeur légale** | Faible | Moyenne | Haute | Très haute |
| **Déploiement** | Immédiat | 1 jour | 1 semaine | 1-2 mois |

### Recommandations d'usage

**Certificat P12/PFX** :
- ✅ Développement et tests
- ✅ Signatures internes
- ❌ Documents légaux externes

**Carte eID** :
- ✅ Citoyens belges
- ✅ Documents officiels
- ✅ Administration locale
- ❌ Signature mobile

**itsme®** :
- ✅ Signature mobile
- ✅ Grand public
- ✅ Onboarding client
- ❌ Budget limité (coûts par signature)

**CSAM / MyGov.be** :
- ✅ Administration publique
- ✅ Documents officiels d'État
- ✅ Conformité maximale
- ❌ Secteur privé (non accessible)

---

## Configuration Complète (.env)

```ini
# ================================
# SIGNATURE ÉLECTRONIQUE
# ================================

# eID belge
EID_MIDDLEWARE_URL=http://localhost:15051

# itsme®
ITSME_CLIENT_ID=your_itsme_client_id
ITSME_CLIENT_SECRET=your_itsme_client_secret
ITSME_REDIRECT_URI=http://localhost:5000/api/v1/pdf-sign/itsme/callback
ITSME_ENV=sandbox  # sandbox ou production

# CSAM (MyGov.be)
CSAM_CLIENT_ID=your_csam_client_id
CSAM_CLIENT_SECRET=your_csam_client_secret
CSAM_REDIRECT_URI=http://localhost:5000/api/v1/pdf-sign/csam/callback
CSAM_ENV=acceptance  # acceptance ou production
```

---

## Dépannage

### Problèmes courants

**1. "Méthode non disponible"**
```bash
# Vérifier la configuration
cd backend
cat .env | grep -E "(EID|ITSME|CSAM)"

# Tester l'API
curl http://localhost:5000/api/v1/pdf-sign/methods
```

**2. "Erreur CORS"**
- Vérifiez que le frontend et backend sont sur les mêmes domaines autorisés
- Ajoutez les headers CORS dans `backend/app.js`

**3. "Invalid state (CSRF)"**
- Le state OAuth2 est perdu → Activez les sessions
- Installez `express-session` :
  ```bash
  cd backend
  npm install express-session
  ```

**4. Logs de débogage**

Activez les logs détaillés :
```javascript
// backend/services/eid-service.js
console.log('Debug eID:', { cardInfo, certInfo })

// backend/services/itsme-service.js
console.log('itsme flow:', { accessToken, userInfo })

// backend/services/csam-service.js
console.log('CSAM request:', { requestId, status })
```

### Support

**eID** :
- Documentation : https://eid.belgium.be/fr
- Support technique : support@eid.belgium.be

**itsme®** :
- Documentation : https://brand.belgianmobileid.be/d/CX5YsAKEmVI7
- Support partenaires : partners@itsme.be
- Portal : https://partner.itsme.be

**CSAM** :
- Documentation : https://www.belgif.be
- Contact BOSA : iam@bosa.fgov.be

---

## Conformité et Légalité

### Règlement eIDAS

Toutes les méthodes implémentées respectent le règlement **eIDAS** (electronic IDentification, Authentication and trust Services) :

- ✅ **eID** : Signature avancée
- ✅ **itsme®** : Signature avancée ou qualifiée (selon niveau)
- ✅ **CSAM** : Signature qualifiée

### Valeur légale

| Méthode | Valeur juridique | Refusable par un juge ? |
|---------|------------------|-------------------------|
| Certificat | Faible | Oui | 
| eID | Moyenne-Haute | Peu probable |
| itsme® Avancé | Haute | Peu probable |
| itsme® Qualifié | **Très haute** | Non* |
| CSAM | **Très haute** | Non* |

*Sauf preuve de fraude ou non-consentement

### GDPR

- ✅ Toutes les données personnelles sont traitées conformément au RGPD
- ✅ Aucune donnée n'est stockée sans consentement
- ✅ Droit à l'effacement respecté

---

## Annexes

### Formats de signature supportés

- **PAdES** (PDF Advanced Electronic Signature) - Recommandé
- **PKCS#7** - Format de base
- **XAdES** - Pour documents XML
- **CAdES** - Pour tout type de fichier

### Algorithmes

- **Hash** : SHA-256 (recommandé), SHA-384, SHA-512
- **Chiffrement** : RSA 2048 bits minimum (recommandé: 4096)
- **Certificats** : X.509v3

### Timestamps

Tous les services fournissent des **horodatages qualifiés** :
- itsme® : Via Certipost TSA
- CSAM : Via Certipost ou GlobalSign TSA
- eID : Horodatage local (non qualifié)

---

**Version** : 1.0
**Dernière mise à jour** : 19 février 2026
**Auteur** : MACCAM CRM Development Team
