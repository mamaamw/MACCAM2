# Formats Supportés pour Conversion PDF

## Total : 60+ extensions de fichiers

### 📸 Images (18 formats) - ✅ Conversion native
Aucune dépendance externe requise (sharp + pdf-lib)

#### JPEG et variants
- `.jpg` - JPEG standard
- `.jpeg` - JPEG standard
- `.jfif` - JPEG File Interchange Format
- `.jpe` - JPEG extension alternative
- `.jfi` - JPEG File Interchange

#### Formats standards
- `.png` - Portable Network Graphics
- `.gif` - Graphics Interchange Format (première frame si animé)
- `.bmp` - Bitmap
- `.dib` - Device Independent Bitmap

#### Formats modernes
- `.webp` - WebP (Google)
- `.avif` - AV1 Image Format
- `.heic` - High Efficiency Image Container (iPhone)
- `.heif` - High Efficiency Image Format

#### TIFF
- `.tiff` - Tagged Image File Format
- `.tif` - TIFF abrégé

#### Vectoriel et icônes
- `.svg` - Scalable Vector Graphics
- `.ico` - Icon
- `.cur` - Cursor icon

---

### 📄 Documents Office (34 formats) - ⚠️ Nécessite LibreOffice

#### Microsoft Word (6 formats)
- `.doc` - Word 97-2003
- `.docx` - Word 2007+
- `.dot` - Word Template 97-2003
- `.dotx` - Word Template 2007+
- `.docm` - Word Macro-Enabled
- `.dotm` - Word Macro-Enabled Template

#### Microsoft Excel (8 formats)
- `.xls` - Excel 97-2003
- `.xlsx` - Excel 2007+
- `.xlt` - Excel Template 97-2003
- `.xltx` - Excel Template 2007+
- `.xlsm` - Excel Macro-Enabled
- `.xltm` - Excel Macro-Enabled Template
- `.xlsb` - Excel Binary Workbook
- `.csv` - Comma-Separated Values

#### Microsoft PowerPoint (9 formats)
- `.ppt` - PowerPoint 97-2003
- `.pptx` - PowerPoint 2007+
- `.pot` - PowerPoint Template 97-2003
- `.potx` - PowerPoint Template 2007+
- `.pps` - PowerPoint Show 97-2003
- `.ppsx` - PowerPoint Show 2007+
- `.pptm` - PowerPoint Macro-Enabled
- `.potm` - PowerPoint Macro-Enabled Template
- `.ppsm` - PowerPoint Macro-Enabled Show

#### OpenDocument (9 formats)
- `.odt` - OpenDocument Text
- `.ott` - OpenDocument Text Template
- `.ods` - OpenDocument Spreadsheet
- `.ots` - OpenDocument Spreadsheet Template
- `.odp` - OpenDocument Presentation
- `.otp` - OpenDocument Presentation Template
- `.odg` - OpenDocument Graphics
- `.otg` - OpenDocument Graphics Template
- `.odf` - OpenDocument Formula

#### Legacy OpenOffice (6 formats)
- `.sxw` - OpenOffice Writer 1.0
- `.stw` - OpenOffice Writer Template 1.0
- `.sxc` - OpenOffice Calc 1.0
- `.stc` - OpenOffice Calc Template 1.0
- `.sxi` - OpenOffice Impress 1.0
- `.sti` - OpenOffice Impress Template 1.0

---

### 🌐 Web/HTML (4 formats) - ⚠️ Nécessite LibreOffice
- `.html` - HyperText Markup Language
- `.htm` - HTML court
- `.xhtml` - eXtensible HTML
- `.mhtml` - MIME HTML
- `.mht` - MHTML court

---

### 📝 Texte et Code (17 formats) - ✅ Conversion native
Aucune dépendance externe requise (pdf-lib)

#### Texte simple
- `.txt` - Texte brut
- `.text` - Texte brut (variant)
- `.rtf` - Rich Text Format
- `.log` - Fichiers log

#### Markdown
- `.md` - Markdown
- `.markdown` - Markdown (complet)

#### Données structurées
- `.csv` - Comma-Separated Values
- `.xml` - eXtensible Markup Language
- `.json` - JavaScript Object Notation
- `.yaml` - YAML Ain't Markup Language
- `.yml` - YAML court

#### Configuration
- `.ini` - Initialization file
- `.conf` - Configuration file
- `.config` - Configuration file
- `.properties` - Java properties

#### Scripts et code
- `.sql` - Structured Query Language
- `.sh` - Shell script
- `.bash` - Bash script
- `.bat` - Batch script (Windows)
- `.cmd` - Command script (Windows)
- `.ps1` - PowerShell script

---

## Résumé par méthode de conversion

### ✅ Conversion directe (35 formats)
**Aucune installation requise**
- Images : 18 formats
- Texte/Code : 17 formats

### ⚠️ Via LibreOffice (38 formats)
**Nécessite LibreOffice installé sur le serveur**
- Office : 34 formats
- Web/HTML : 4 formats

---

## Installation de LibreOffice

### Windows
```powershell
# Télécharger depuis https://www.libreoffice.org/download/download/
# Installer dans C:\Program Files\LibreOffice\
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libreoffice
```

### macOS
```bash
brew install libreoffice
```

---

## Limitations

- **Taille maximale** : 100 MB par fichier
- **Timeout LibreOffice** : 60 secondes
- **GIF animés** : Seule la première frame est convertie
- **Fichiers corrompus** : Retourneront une erreur
- **Formats RAW photo** : Non supportés actuellement

---

## Notes techniques

### Images
- Converties via **sharp** (traitement) et **pdf-lib** (génération PDF)
- Dimensions d'origine préservées
- Format PNG interne pour garantir la qualité

### Documents Office
- Convertis via **LibreOffice** en mode headless
- Nécessite que LibreOffice soit dans le PATH système
- Gère automatiquement les macros (désactivées)

### Texte
- Convertis directement via **pdf-lib**
- Police par défaut utilisée
- Taille A4 (595 x 842 points)
- Marge : 50 points
- Taille de police : 12pt
- Interligne : 1.2

### HTML
- Utilise le moteur de rendu de LibreOffice
- CSS basique supporté
- JavaScript non exécuté (pour sécurité)
