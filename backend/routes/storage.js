import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { protect } from '../middleware/auth.middleware.js';
import * as smbClient from '../utils/smbClient.js';

const router = express.Router();

// Liste des partages disponibles sur le NAS UGREEN
// Note: Peut être déplacé dans la configuration ou détecté dynamiquement
const AVAILABLE_SHARES = [
  { name: 'Camille et Marius', description: 'Partage personnel' },
  { name: 'Photos', description: 'Photos' },
  { name: 'Photos-vidéos', description: 'Photos et vidéos' },
  { name: 'Films', description: 'Films' },
  { name: 'Musiques', description: 'Musiques' },
  { name: 'Divers', description: 'Divers' },
  { name: 'docker', description: 'Docker' },
  { name: 'personal_folder', description: 'Dossiers personnels' }
];

// Configuration multer pour upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

/**
 * GET /api/storage/shares
 * Lister les partages disponibles
 */
router.get('/shares', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      shares: AVAILABLE_SHARES,
      currentShare: process.env.NAS_SHARE || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des partages',
      error: error.message
    });
  }
});

/**
 * GET /api/storage
 * Lister les fichiers d'un dossier ou les partages
 */
router.get('/', protect, async (req, res) => {
  try {
    const { path: folderPath = '', share } = req.query;
    
    // Si un partage est spécifié dans la requête, l'utiliser
    const shareName = share || process.env.NAS_SHARE;
    
    const files = await smbClient.listFiles(folderPath, shareName);
    
    // Si on liste les partages (path vide et pas de share configuré)
    if (!process.env.NAS_SHARE && !folderPath) {
      const shares = files.map(share => ({
        name: share.name || share,
        path: share.name || share,
        isDirectory: true,
        isShare: true,
        type: 'share',
        size: 0,
        icon: 'server'
      }));
      
      return res.json({
        success: true,
        path: '',
        files: shares,
        isRoot: true
      });
    }
    
    // Enrichir les informations des fichiers
    const enrichedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const fileName = file.name || file;
          const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
          const stats = await smbClient.getFileInfo(filePath);
          
          return {
            name: fileName,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modifiedTime: stats.mtime,
            createdTime: stats.birthtime,
            type: getFileType(fileName)
          };
        } catch (err) {
          // Si on ne peut pas obtenir les stats, c'est probablement un partage
          const fileName = file.name || file;
          return {
            name: fileName,
            path: folderPath ? `${folderPath}/${fileName}` : fileName,
            isDirectory: true,
            isShare: !folderPath || !folderPath.includes('/'),
            type: 'folder',
            size: 0
          };
        }
      })
    );
    
    // Trier : dossiers d'abord, puis fichiers par nom
    enrichedFiles.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      success: true,
      path: folderPath,
      files: enrichedFiles
    });
  } catch (error) {
    console.error('Erreur liste fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
});

/**
 * GET /api/storage/download/:path
 * Télécharger un fichier
 */
router.get('/download/*', protect, async (req, res) => {
  try {
    const filePath = req.params[0];
    const { share } = req.query;
    const shareName = share || process.env.NAS_SHARE;
    
    const fileData = await smbClient.readFile(filePath, shareName);
    const fileName = path.basename(filePath);
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(fileData);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement',
      error: error.message
    });
  }
});

/**
 * GET /api/storage/preview/:path
 * Prévisualiser une image (avec thumbnail)
 */
router.get('/preview/*', protect, async (req, res) => {
  try {
    const filePath = req.params[0];
    const { thumbnail, share } = req.query;
    const shareName = share || process.env.NAS_SHARE;
    
    const fileData = await smbClient.readFile(filePath, shareName);
    const ext = path.extname(filePath).toLowerCase();
    
    // Si c'est une image et qu'on demande un thumbnail
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) && thumbnail === 'true') {
      const thumbnailBuffer = await sharp(fileData)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(thumbnailBuffer);
    } else {
      // Sinon envoyer le fichier original
      const mimeType = getMimeType(ext);
      res.setHeader('Content-Type', mimeType);
      res.send(fileData);
    }
  } catch (error) {
    console.error('Erreur prévisualisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la prévisualisation',
      error: error.message
    });
  }
});

/**
 * POST /api/storage/upload
 * Uploader un fichier
 */
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { path: folderPath = '', share } = req.body;
    const shareName = share || process.env.NAS_SHARE;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
    
    const fileName = req.file.originalname;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Vérifier si le fichier existe déjà
    const fileExists = await smbClient.exists(filePath, shareName);
    if (fileExists) {
      return res.status(409).json({
        success: false,
        message: 'Un fichier avec ce nom existe déjà'
      });
    }
    
    // Écrire le fichier sur le NAS
    await smbClient.writeFile(filePath, req.file.buffer, shareName);
    
    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      file: {
        name: fileName,
        path: filePath,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
});

/**
 * POST /api/storage/folder
 * Créer un dossier
 */
router.post('/folder', protect, async (req, res) => {
  try {
    const { path: folderPath, name, share } = req.body;
    const shareName = share || process.env.NAS_SHARE;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nom du dossier requis'
      });
    }
    
    const newFolderPath = folderPath ? `${folderPath}/${name}` : name;
    
    // Vérifier si le dossier existe déjà
    const exists = await smbClient.exists(newFolderPath, shareName);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Un dossier avec ce nom existe déjà'
      });
    }
    
    await smbClient.createDirectory(newFolderPath, shareName);
    
    res.json({
      success: true,
      message: 'Dossier créé avec succès',
      folder: {
        name,
        path: newFolderPath
      }
    });
  } catch (error) {
    console.error('Erreur création dossier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du dossier',
      error: error.message
    });
  }
});

/**
 * DELETE /api/storage/file
 * Supprimer un fichier
 */
router.delete('/file', protect, async (req, res) => {
  try {
    const { path: filePath, share } = req.body;
    const shareName = share || process.env.NAS_SHARE;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Chemin du fichier requis'
      });
    }
    
    await smbClient.deleteFile(filePath, shareName);
    
    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

/**
 * DELETE /api/storage/folder
 * Supprimer un dossier
 */
router.delete('/folder', protect, async (req, res) => {
  try {
    const { path: folderPath, share } = req.body;
    const shareName = share || process.env.NAS_SHARE;
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: 'Chemin du dossier requis'
      });
    }
    
    await smbClient.deleteDirectory(folderPath, shareName);
    
    res.json({
      success: true,
      message: 'Dossier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression dossier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
});

/**
 * GET /api/storage/gallery
 * Obtenir tous les fichiers images/vidéos pour la galerie
 */
router.get('/gallery', protect, async (req, res) => {
  try {
    const { path: folderPath = '', share } = req.query;
    const shareName = share || process.env.NAS_SHARE;
    
    const allMedia = await getMediaFilesRecursive(folderPath, shareName);
    
    res.json({
      success: true,
      count: allMedia.length,
      media: allMedia
    });
  } catch (error) {
    console.error('Erreur galerie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la galerie',
      error: error.message
    });
  }
});

// Fonctions utilitaires

function getFileType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const types = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
    video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    document: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    spreadsheet: ['.xls', '.xlsx', '.csv', '.ods'],
    presentation: ['.ppt', '.pptx', '.odp'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz']
  };
  
  for (const [type, extensions] of Object.entries(types)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }
  
  return 'other';
}

function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

async function getMediaFilesRecursive(folderPath, shareName, result = []) {
  try {
    const files = await smbClient.listFiles(folderPath, shareName);
    
    for (const file of files) {
      const filePath = folderPath ? `${folderPath}/${file}` : file;
      
      try {
        const stats = await smbClient.getFileInfo(filePath, shareName);
        
        if (stats.isDirectory()) {
          // Récursion dans les sous-dossiers
          await getMediaFilesRecursive(filePath, shareName, result);
        } else {
          const fileType = getFileType(file);
          if (fileType === 'image' || fileType === 'video') {
            result.push({
              name: file,
              path: filePath,
              type: fileType,
              size: stats.size,
              modifiedTime: stats.mtime
            });
          }
        }
      } catch (err) {
        console.error(`Erreur traitement ${filePath}:`, err);
      }
    }
  } catch (err) {
    console.error(`Erreur lecture dossier ${folderPath}:`, err);
  }
  
  return result;
}

export default router;
