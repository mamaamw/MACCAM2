# Configuration de la conversion PDF

## Fonctionnalité

La route `/api/v1/convert-to-pdf` permet de convertir différents types de fichiers en PDF :

### Formats supportés (60+ extensions)

#### ✅ Images (Conversion native via sharp + pdf-lib)
**JPEG variants:**
- JPG, JPEG, JFIF, JPE, JFI

**PNG:**
- PNG

**GIF:**
- GIF (première frame pour les GIF animés)

**BMP:**
- BMP, DIB

**Formats modernes:**
- WEBP, AVIF, HEIC, HEIF

**TIFF:**
- TIFF, TIF

**Vectoriel:**
- SVG

**Icônes:**
- ICO, CUR

Ces formats sont convertis directement via **sharp** et **pdf-lib** (aucune dépendance externe requise).

#### ✅ Documents texte (Conversion native via pdf-lib)
- TXT, TEXT
- RTF
- MD, MARKDOWN
- LOG
- CSV
- XML
- JSON
- YAML, YML
- INI
- CONF, CONFIG
- PROPERTIES
- SQL
- SH, BASH
- BAT, CMD
- PS1

Ces formats sont convertis directement via **pdf-lib** (aucune dépendance externe requise).

#### ⚠️ Documents Office et HTML (Nécessite LibreOffice)

**Microsoft Word:**
- DOC, DOCX, DOT, DOTX, DOCM, DOTM

**Microsoft Excel:**
- XLS, XLSX, XLT, XLTX, XLSM, XLTM, XLSB, CSV

**Microsoft PowerPoint:**
- PPT, PPTX, POT, POTX, PPS, PPSX, PPTM, POTM, PPSM

**OpenDocument:**
- ODT, OTT (Traitement de texte)
- ODS, OTS (Tableur)
- ODP, OTP (Présentation)
- ODG, OTG (Dessin)
- ODF (Formule)

**Legacy OpenOffice:**
- SXW, STW (Writer)
- SXC, STC (Calc)
- SXI, STI (Impress)

**Web:**
- HTML, HTM
- XHTML
- MHTML, MHT

Ces formats nécessitent l'installation de **LibreOffice** sur le serveur.

## Installation de LibreOffice

### Windows

1. Télécharger LibreOffice depuis : https://www.libreoffice.org/download/download/
2. Installer LibreOffice avec les paramètres par défaut
3. Le service détectera automatiquement l'installation dans :
   - `C:\Program Files\LibreOffice\program\soffice.exe`
   - `C:\Program Files (x86)\LibreOffice\program\soffice.exe`

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libreoffice
```

### Linux (CentOS/RHEL)

```bash
sudo yum install libreoffice
```

### macOS

```bash
brew install libreoffice
```

Ou télécharger depuis : https://www.libreoffice.org/download/download/

## Vérification de l'installation

Pour vérifier que LibreOffice est correctement installé :

**Windows :**
```powershell
& "C:\Program Files\LibreOffice\program\soffice.exe" --version
```

**Linux/macOS :**
```bash
soffice --version
```

Vous devriez voir la version de LibreOffice s'afficher.

## Utilisation

### API Endpoint

```
POST /api/v1/convert-to-pdf
```

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Body
```
file: <fichier à convertir>
```

### Réponse
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="<nom_du_fichier>.pdf"
```

Le PDF converti est retourné directement en tant que blob.

## Limitations

- Taille maximale de fichier : **100 MB**
- Timeout de conversion Office : **60 secondes**
- Les fichiers temporaires sont automatiquement supprimés après conversion

## Messages d'erreur

### "Format de fichier non supporté"
Le type de fichier n'est pas dans la liste des formats supportés.

### "LibreOffice n'est pas installé sur ce système"
LibreOffice est requis pour convertir des documents Office ou HTML. Installez LibreOffice sur le serveur.

### "Échec de la conversion du document Office"
La conversion avec LibreOffice a échoué. Vérifiez :
- Que LibreOffice est correctement installé
- Que le fichier n'est pas corrompu
- Que LibreOffice a les permissions nécessaires

### "Le fichier PDF n'a pas été créé"
La conversion s'est terminée mais le fichier de sortie est introuvable. Vérifiez les permissions d'écriture dans le dossier `uploads/temp-conversions/`.

## Dépendances Node.js

Les packages suivants sont utilisés :

- **pdf-lib** : Manipulation de PDF
- **sharp** : Traitement d'images
- **multer** : Upload de fichiers
- **child_process** : Exécution de LibreOffice

Tous sont déjà installés via `npm install`.
