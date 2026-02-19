# 🔐 Signature Électronique PDF - Guide d'Utilisation

## 📋 Fonctionnalités Implémentées

### ✅ Disponible Maintenant
- **Signature avec certificat P12/PFX**
  - Upload de votre propre certificat
  - Certificat de test fourni (mot de passe: `demo`)
  - Signature cryptographique conforme aux standards

### 🔄 En Cours de Développement
- **Carte eID belge**
  - Nécessite le middleware Belgium eID
  - Interface prête, intégration à compléter
  
- **itsme®**
  - Nécessite inscription partenaire itsme
  - OAuth2 flow à implémenter

## 🚀 Comment Utiliser

### Option 1: Certificat de Test (Recommandé pour les tests)

1. **Accédez à l'onglet "Signer PDF"**
   - URL: http://localhost:3000/apps/sign-pdf

2. **Chargez votre PDF**
   - Cliquez sur "Charger le PDF"
   - Sélectionnez votre fichier

3. **Section "Signature Électronique Qualifiée"**
   - Méthode: Sélectionnez "Certificat P12/PFX"
   - Cliquez sur "Télécharger un certificat de test"
   - Un fichier `demo-certificate.p12` sera téléchargé

4. **Uploadez le certificat**
   - Champ "Certificat (.p12 / .pfx)": Uploadez le fichier téléchargé
   - Mot de passe: Entrez `demo`
   - Nom du signataire: Votre nom
   - Raison: Ex: "Test de signature"

5. **Signez**
   - Cliquez sur "Signer Électroniquement"
   - Le PDF signé sera téléchargé avec le suffixe `-electronically-signed.pdf`

### Option 2: Votre Propre Certificat

Si vous avez déjà un certificat P12/PFX:

1. Uploadez votre certificat (.p12 ou .pfx)
2. Entrez votre mot de passe
3. Remplissez les informations
4. Cliquez sur "Signer Électroniquement"

## 🔍 Vérifier la Signature

Pour vérifier que votre PDF est bien signé:

### Avec Adobe Reader
1. Ouvrez le PDF signé
2. Panneau "Signatures" (Ctrl+D)
3. Vous verrez la signature avec les détails

### Avec un lecteur PDF en ligne
- [PDFSigner](https://www.pdfsigner.com/verify)
- [DocuSign](https://www.docusign.com/fr-fr)

## 🛠️ API Backend

### Endpoints Disponibles

#### POST `/api/v1/pdf-sign/digital-sign`
Signer un PDF électroniquement

**Paramètres (FormData):**
- `pdf` (File): Le fichier PDF à signer
- `certificate` (File): Le certificat P12/PFX
- `certificatePassword` (String): Mot de passe du certificat
- `signMethod` (String): 'certificate', 'eid', ou 'itsme'
- `reason` (String): Raison de la signature
- `name` (String): Nom du signataire

**Réponse:** Fichier PDF signé

#### GET `/api/v1/pdf-sign/methods`
Obtenir les méthodes de signature disponibles

**Réponse:**
```json
{
  "methods": [
    {
      "id": "certificate",
      "name": "Certificat P12/PFX",
      "available": true,
      "requiresPassword": true
    },
    ...
  ]
}
```

#### GET `/api/v1/pdf-sign/demo-certificate`
Télécharger le certificat de démonstration

**Réponse:** Fichier `demo-certificate.p12`

## 📝 Créer un Nouveau Certificat de Test

Si vous voulez recréer le certificat de test:

```bash
cd backend
node create-demo-cert.js
```

Cela créera un nouveau certificat auto-signé valide 1 an.

## 🔒 Intégration carte eID (À faire)

### Prérequis
1. Installer [Belgium eID Middleware](https://eid.belgium.be/fr/installer-le-logiciel-eid)
2. Lecteur de cartes compatible
3. Carte eID valide

### Implémentation nécessaire
```javascript
// Dans pdf-sign.routes.js
case 'eid':
  // 1. Détecter le middleware eID
  // 2. Lire le certificat depuis la carte
  // 3. Demander le PIN à l'utilisateur
  // 4. Signer avec le certificat de la carte
  break
```

**Bibliothèques suggérées:**
- [eid-javascript-lib](https://github.com/Twi1ightSparkle/eid-javascript-lib)
- [node-eid](https://www.npmjs.com/package/node-eid)

## 🌟 Intégration itsme® (À faire)

### Prérequis
1. S'inscrire sur [itsme® for Partners](https://www.itsme.be/fr/entreprises)
2. Obtenir Client ID et Secret
3. Configurer Redirect URL

### Implémentation nécessaire
```javascript
// OAuth2 Flow
case 'itsme':
  // 1. Rediriger vers itsme OAuth
  // 2. Récupérer le token d'accès
  // 3. Obtenir le certificat qualifié
  // 4. Signer le PDF
  break
```

**Documentation:**
- [itsme® Developer Portal](https://brand.belgianmobileid.be/d/CX5YsAKEmVI7/get-started)

## ⚠️ Notes Importantes

### Sécurité en Production
- **Ne jamais** stocker les mots de passe en clair
- Utiliser HTTPS pour tous les transferts
- Implémenter l'authentification pour les routes sensibles
- Valider et sanitiser tous les inputs
- Limiter la taille des fichiers uploadés
- Logger toutes les opérations de signature

### Conformité Légale
- Une signature électronique qualifiée a la même valeur légale qu'une signature manuscrite en Europe (eIDAS)
- Le certificat de test n'est **PAS** valide pour des documents officiels
- Pour une vraie signature qualifiée, utilisez:
  - Un certificat émis par une Autorité de Certification reconnue
  - Une carte eID
  - itsme® (service de signature qualifiée)

## 🐛 Dépannage

### "Certificat de test non disponible"
```bash
cd backend
node create-demo-cert.js
```

### "Erreur lors de la signature"
- Vérifiez le mot de passe du certificat
- Assurez-vous que le PDF n'est pas corrompu
- Vérifiez les logs du backend pour plus de détails

### "Cannot use the same canvas during multiple render()"
- Ce problème est lié au rendu PDF, pas à la signature
- Rafraîchissez la page si nécessaire

## 📚 Ressources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [node-forge Certificate](https://github.com/digitalbazaar/forge#x509)
- [eIDAS Regulation](https://ec.europa.eu/digital-building-blocks/wikis/display/DIGITAL/eIDAS)
- [Belgium eID](https://eid.belgium.be/)
- [itsme®](https://www.itsme.be/)

## 📞 Support

Pour toute question ou problème:
1. Vérifiez les logs du backend
2. Consultez la console du navigateur (F12)
3. Testez avec le certificat de démonstration d'abord

---

**🎉 Bonne signature électronique!**
