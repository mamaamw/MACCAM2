import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Configuration du dossier d'upload pour les projets PDF
const PDF_PROJECTS_DIR = path.join(process.cwd(), 'uploads', 'pdf-merge-projects');
if (!fs.existsSync(PDF_PROJECTS_DIR)) {
  fs.mkdirSync(PDF_PROJECTS_DIR, { recursive: true });
}

// Configuration multer pour l'upload des PDF
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      // Créer un sous-dossier unique pour chaque projet
      const projectId = `project-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const projectDir = path.join(PDF_PROJECTS_DIR, projectId);
      
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }
      
      // Stocker le chemin du projet dans req pour l'utiliser après
      _req.projectDir = projectDir;
      _req.projectId = projectId;
      
      cb(null, projectDir);
    },
    filename: (_req, file, cb) => {
      // Garder le nom original du fichier (nettoyé)
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, safeName);
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB par fichier
    files: 500 // Maximum 500 fichiers
  }
});

// Protection des routes
router.use(protect);

/**
 * POST /api/v1/pdf-merge-projects
 * Créer un nouveau projet de fusion PDF
 */
router.post('/', protect, upload.array('files', 50), async (req, res) => {
  try {
    const { name, description, filesData } = req.body;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    if (!name || !filesData) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du projet et les données des fichiers sont requis'
      });
    }

    const parsedFilesData = JSON.parse(filesData);
    const totalPages = parsedFilesData.reduce((sum, file) => 
      sum + (file.selectedPages?.length || 0), 0
    );

    // Créer le projet dans la base de données
    const project = await prisma.pdfMergeProject.create({
      data: {
        userId,
        name,
        description: description || null,
        filesData,
        filesDirectory: req.projectId,
        totalFiles: req.files.length,
        totalPages
      }
    });

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      project
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    
    // Nettoyer les fichiers en cas d'erreur
    if (req.projectDir && fs.existsSync(req.projectDir)) {
      fs.rmSync(req.projectDir, { recursive: true, force: true });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/pdf-merge-projects
 * Lister tous les projets de l'utilisateur
 */
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const projects = await prisma.pdfMergeProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/pdf-merge-projects/:id
 * Obtenir les détails d'un projet
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.pdfMergeProject.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/pdf-merge-projects/:id/files
 * Obtenir les fichiers d'un projet (pour les télécharger)
 */
router.get('/:id/files', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.pdfMergeProject.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable'
      });
    }

    const projectDir = path.join(PDF_PROJECTS_DIR, project.filesDirectory);
    
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({
        success: false,
        message: 'Fichiers du projet introuvables'
      });
    }

    const files = fs.readdirSync(projectDir);
    const filesData = JSON.parse(project.filesData);

    console.log('Fichiers physiques:', files);
    console.log('Métadonnées fichiers:', filesData);

    // Helper pour normaliser les noms de fichiers (comme multer le fait)
    const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Mapper les fichiers physiques avec leurs métadonnées
    const filesWithUrls = files.map(physicalFileName => {
      console.log('Traitement fichier physique:', physicalFileName);
      
      // Chercher les métadonnées correspondantes
      // Le nom physique peut contenir un hash au début (hash-nomfichier.pdf)
      // ou être simplement le nom nettoyé
      let metadata = filesData.find(fd => {
        const cleanOriginalName = sanitizeFilename(fd.name);
        // Vérifier correspondance exacte
        if (cleanOriginalName === physicalFileName) {
          return true;
        }
        // Vérifier si le nom physique se termine par le nom nettoyé
        if (physicalFileName.endsWith(cleanOriginalName)) {
          return true;
        }
        // Vérifier si le nom physique se termine par le nom original
        if (physicalFileName.endsWith(fd.name)) {
          return true;
        }
        // Vérifier si le nom nettoyé est dans le nom physique (après un tiret)
        const parts = physicalFileName.split('-');
        if (parts.length > 1 && parts.slice(1).join('-') === cleanOriginalName) {
          return true;
        }
        return false;
      });

      console.log('Métadonnées trouvées:', metadata);
      
      return {
        name: physicalFileName, // Nom physique du fichier
        originalName: metadata?.name || physicalFileName, // Nom original
        pageCount: metadata?.pageCount || 0,
        selectedPages: metadata?.selectedPages || [],
        url: `/api/v1/pdf-merge-projects/${id}/file/${encodeURIComponent(physicalFileName)}`
      };
    });

    console.log('Fichiers avec URLs:', filesWithUrls);

    res.json({
      success: true,
      files: filesWithUrls,
      projectDir: project.filesDirectory
    });
  } catch (error) {
    console.error('Erreur récupération fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/pdf-merge-projects/:id/file/:filename
 * Télécharger un fichier spécifique du projet
 */
router.get('/:id/file/:filename', protect, async (req, res) => {
  try {
    const { id, filename } = req.params;
    const userId = req.user.id;

    const project = await prisma.pdfMergeProject.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable'
      });
    }

    const filePath = path.join(PDF_PROJECTS_DIR, project.filesDirectory, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier introuvable'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Erreur téléchargement fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/pdf-merge-projects/:id
 * Mettre à jour un projet
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, filesData } = req.body;
    const userId = req.user.id;

    const project = await prisma.pdfMergeProject.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (filesData) {
      updateData.filesData = filesData;
      const parsedFilesData = JSON.parse(filesData);
      updateData.totalPages = parsedFilesData.reduce((sum, file) => 
        sum + (file.selectedPages?.length || 0), 0
      );
    }

    const updatedProject = await prisma.pdfMergeProject.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      project: updatedProject
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/pdf-merge-projects/:id
 * Supprimer un projet et ses fichiers
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.pdfMergeProject.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet introuvable'
      });
    }

    // Supprimer les fichiers
    const projectDir = path.join(PDF_PROJECTS_DIR, project.filesDirectory);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    // Supprimer le projet de la base de données
    await prisma.pdfMergeProject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
});

export default router;
