import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads', 'qr');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const baseName = path.basename(file.originalname || 'media', ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .slice(0, 60) || 'media';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`);
    }
  }),
  limits: {
    fileSize: 150 * 1024 * 1024
  }
});

router.use(protect);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const mediaType = req.body?.mediaType;
    const mime = req.file.mimetype || '';

    if (mediaType === 'images' && !mime.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier doit être une image'
      });
    }

    if (mediaType === 'video' && !mime.startsWith('video/')) {
      return res.status(400).json({
        success: false,
        message: 'Le fichier doit être une vidéo'
      });
    }

    const relativePath = `/uploads/qr/${req.file.filename}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    return res.status(201).json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl,
        path: relativePath
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du média',
      error: error.message
    });
  }
});

export default router;
