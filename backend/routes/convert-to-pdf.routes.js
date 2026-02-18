import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { protect } from '../middleware/auth.middleware.js';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const execPromise = promisify(exec);
const router = express.Router();

// Configuration du dossier temporaire
const TEMP_DIR = path.join(process.cwd(), 'uploads', 'temp-conversions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configuration multer pour l'upload temporaire
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, TEMP_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  }
});

/**
 * Convertir une image en PDF
 */
async function convertImageToPdf(imagePath, outputPath) {
  try {
    // Lire l'image avec sharp et obtenir ses dimensions
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    
    // Convertir l'image en PNG si nécessaire
    const pngBuffer = await image.png().toBuffer();
    
    // Embed l'image dans le PDF
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    
    // Créer une page avec les dimensions de l'image
    const page = pdfDoc.addPage([metadata.width, metadata.height]);
    
    // Dessiner l'image sur la page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: metadata.width,
      height: metadata.height
    });
    
    // Sauvegarder le PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    return true;
  } catch (error) {
    console.error('Erreur conversion image:', error);
    throw new Error('Échec de la conversion de l\'image');
  }
}

/**
 * Convertir un document Office en PDF avec LibreOffice
 */
async function convertOfficeToPdf(inputPath, outputDir) {
  try {
    // Vérifier si LibreOffice est installé
    const libreOfficePaths = [
      'soffice', // Linux
      '/usr/bin/soffice', // Linux alternative
      '/Applications/LibreOffice.app/Contents/MacOS/soffice', // macOS
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe', // Windows
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe' // Windows 32-bit
    ];
    
    let libreOfficeCmd = null;
    for (const loPath of libreOfficePaths) {
      try {
        await execPromise(`"${loPath}" --version`);
        libreOfficeCmd = loPath;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!libreOfficeCmd) {
      throw new Error('LibreOffice n\'est pas installé sur ce système');
    }
    
    // Convertir avec LibreOffice
    const cmd = `"${libreOfficeCmd}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    await execPromise(cmd, { timeout: 60000 });
    
    // Le fichier de sortie aura le même nom mais avec extension .pdf
    const inputFileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, inputFileName + '.pdf');
    
    if (!fs.existsSync(outputPath)) {
      throw new Error('Le fichier PDF n\'a pas été créé');
    }
    
    return outputPath;
  } catch (error) {
    console.error('Erreur conversion Office:', error);
    throw new Error('Échec de la conversion du document Office: ' + error.message);
  }
}

/**
 * Convertir un fichier texte en PDF
 */
async function convertTextToPdf(textPath, outputPath) {
  try {
    const textContent = fs.readFileSync(textPath, 'utf-8');
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const fontSize = 12;
    const margin = 50;
    const maxWidth = 595 - 2 * margin;
    const lineHeight = fontSize * 1.2;
    
    const lines = textContent.split('\n');
    let yPosition = 842 - margin;
    
    for (const line of lines) {
      if (yPosition < margin) {
        // Nouvelle page si nécessaire
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = 842 - margin;
        newPage.drawText(line.substring(0, 80), {
          x: margin,
          y: yPosition,
          size: fontSize
        });
      } else {
        page.drawText(line.substring(0, 80), {
          x: margin,
          y: yPosition,
          size: fontSize
        });
      }
      yPosition -= lineHeight;
    }
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    return true;
  } catch (error) {
    console.error('Erreur conversion texte:', error);
    throw new Error('Échec de la conversion du fichier texte');
  }
}

/**
 * POST /api/v1/convert-to-pdf
 * Convertir n'importe quel fichier en PDF
 */
router.post('/', protect, upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;
  
  try {
    console.log('=== Requête de conversion reçue ===');
    console.log('User:', req.user?.id);
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('Aucun fichier dans la requête');
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    inputPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const outputFileName = path.basename(req.file.originalname, ext) + '.pdf';
    outputPath = path.join(TEMP_DIR, 'output-' + Date.now() + '.pdf');
    
    console.log('Conversion demandée:', {
      original: req.file.originalname,
      extension: ext,
      size: req.file.size
    });
    
    // Déterminer le type de conversion nécessaire
    const imageExts = [
      // JPEG variants
      '.jpg', '.jpeg', '.jfif', '.jpe', '.jfi',
      // PNG
      '.png',
      // GIF
      '.gif',
      // BMP
      '.bmp', '.dib',
      // Modern formats
      '.webp', '.avif', '.heic', '.heif',
      // TIFF
      '.tiff', '.tif',
      // Vector
      '.svg',
      // Icons
      '.ico', '.cur'
    ];
    
    const officeExts = [
      // Microsoft Word
      '.doc', '.docx', '.dot', '.dotx', '.docm', '.dotm',
      // Microsoft Excel
      '.xls', '.xlsx', '.xlt', '.xltx', '.xlsm', '.xltm', '.xlsb', '.csv',
      // Microsoft PowerPoint
      '.ppt', '.pptx', '.pot', '.potx', '.pps', '.ppsx', '.pptm', '.potm', '.ppsm',
      // OpenDocument formats
      '.odt', '.ott', '.ods', '.ots', '.odp', '.otp', '.odg', '.otg', '.odf',
      // Legacy OpenOffice
      '.sxw', '.stw', '.sxc', '.stc', '.sxi', '.sti'
    ];
    
    const textExts = [
      '.txt', '.text',
      '.rtf',
      '.md', '.markdown',
      '.log',
      '.csv',
      '.xml',
      '.json',
      '.yaml', '.yml',
      '.ini',
      '.conf', '.config',
      '.properties',
      '.sql',
      '.sh', '.bash',
      '.bat', '.cmd',
      '.ps1'
    ];
    
    const htmlExts = [
      '.html', '.htm',
      '.xhtml',
      '.mhtml', '.mht'
    ];
    
    if (imageExts.includes(ext)) {
      // Conversion image
      await convertImageToPdf(inputPath, outputPath);
    } else if (officeExts.includes(ext) || htmlExts.includes(ext)) {
      // Conversion Office/HTML avec LibreOffice
      const resultPath = await convertOfficeToPdf(inputPath, TEMP_DIR);
      // Renommer le fichier de sortie
      fs.renameSync(resultPath, outputPath);
    } else if (textExts.includes(ext)) {
      // Conversion texte
      await convertTextToPdf(inputPath, outputPath);
    } else {
      // Format non supporté - Message d'erreur détaillé
      const allSupportedExts = [
        ...imageExts,
        ...officeExts,
        ...textExts,
        ...htmlExts
      ];
      
      return res.status(400).json({
        success: false,
        message: `Format de fichier non supporté : ${ext}`,
        error: {
          extension: ext,
          fileName: req.file.originalname,
          supportedFormatsCount: allSupportedExts.length,
          suggestion: 'Veuillez utiliser un des 60+ formats supportés (Images, Office, Web, Texte)'
        }
      });
    }
    
    // Vérifier que le PDF a été créé
    if (!fs.existsSync(outputPath)) {
      throw new Error('Le fichier PDF n\'a pas été créé');
    }
    
    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
    
    const pdfStream = fs.createReadStream(outputPath);
    pdfStream.pipe(res);
    
    // Nettoyer les fichiers temporaires après l'envoi
    pdfStream.on('end', () => {
      setTimeout(() => {
        try {
          if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
          }
          if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        } catch (err) {
          console.error('Erreur nettoyage fichiers:', err);
        }
      }, 1000);
    });
    
  } catch (error) {
    console.error('Erreur conversion:', error);
    
    // Nettoyer les fichiers en cas d'erreur
    try {
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    } catch (err) {
      console.error('Erreur nettoyage fichiers:', err);
    }
    
    // Messages d'erreur personnalisés
    let errorMessage = error.message || 'Erreur lors de la conversion du fichier';
    let statusCode = 500;
    
    if (error.message?.includes('LibreOffice')) {
      statusCode = 503; // Service Unavailable
      errorMessage = '⚠️ ' + error.message + '. Veuillez installer LibreOffice sur le serveur.';
    } else if (error.message?.includes('Fichier PDF n\'a pas été créé')) {
      errorMessage = 'La conversion a échoué. Le fichier source est peut-être corrompu.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'La conversion a pris trop de temps (timeout). Le fichier est peut-être trop volumineux ou complexe.';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        type: error.name,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

export default router;
