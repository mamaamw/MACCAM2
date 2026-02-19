import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration de multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter uniquement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB
});

router.use(protect);

// GET /api/users - Liste des utilisateurs (Admin/Manager)
router.get('/', authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/profile - Profil de l'utilisateur connecté
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        company: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile - Mettre à jour le profil
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, email, username, phone, company, address, city, country, postalCode, bio } = req.body;
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé par un autre utilisateur' 
        });
      }
    }
    
    // Vérifier si le username est déjà utilisé par un autre utilisateur
    if (username && username !== req.user.username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ce nom d\'utilisateur est déjà pris' 
        });
      }
    }
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        email,
        username,
        phone,
        company,
        address,
        city,
        country,
        postalCode,
        bio
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        company: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'profile_updated',
        description: 'Profil utilisateur mis à jour',
        userId: req.user.id
      }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/password - Changer le mot de passe
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }
    
    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe actuel est incorrect' 
      });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'password_changed',
        description: 'Mot de passe modifié',
        userId: req.user.id
      }
    });
    
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/activity - Historique d'activité de l'utilisateur
router.get('/activity', async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true
      }
    });
    
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/notifications - Récupérer les préférences de notification
router.get('/notifications', async (req, res) => {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });
    
    // Si les paramètres n'existent pas, les créer avec les valeurs par défaut
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.user.id,
          emailNotifications: true,
          taskNotifications: true,
          leadNotifications: true,
          projectNotifications: true,
          newsletter: false
        }
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/notifications - Mettre à jour les préférences de notification
router.put('/notifications', async (req, res) => {
  try {
    const { emailNotifications, taskNotifications, leadNotifications, projectNotifications, newsletter } = req.body;
    
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!settings) {
      // Créer les paramètres s'ils n'existent pas
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.user.id,
          emailNotifications,
          taskNotifications,
          leadNotifications,
          projectNotifications,
          newsletter
        }
      });
    } else {
      // Mettre à jour les paramètres existants
      settings = await prisma.notificationSettings.update({
        where: { userId: req.user.id },
        data: {
          emailNotifications,
          taskNotifications,
          leadNotifications,
          projectNotifications,
          newsletter
        }
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/2fa - Activer/Désactiver 2FA
router.put('/2fa', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: enabled },
      select: {
        id: true,
        twoFactorEnabled: true
      }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        type: '2fa_changed',
        description: `Authentification à deux facteurs ${enabled ? 'activée' : 'désactivée'}`,
        userId: req.user.id
      }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id - Détails d'un utilisateur
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        company: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users - Créer un utilisateur (Admin)
router.post('/', authorize('ADMIN'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'USER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id - Mettre à jour un utilisateur (Admin/Manager)
router.put('/:id', authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        phone,
        role,
        isActive
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true
      }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur (Admin)
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier fourni' 
      });
    }

    // Supprimer l'ancien avatar s'il existe
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true }
    });

    if (currentUser.avatar) {
      const oldAvatarPath = path.join(process.cwd(), currentUser.avatar.replace(/^\//, ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Sauvegarder le chemin de l'avatar dans la base de données
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarPath },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        company: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'avatar_updated',
        description: 'Photo de profil mise à jour',
        userId: req.user.id
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads', 'avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/avatar - Supprimer avatar
router.delete('/avatar', async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true }
    });

    if (!currentUser.avatar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun avatar à supprimer' 
      });
    }

    // Supprimer le fichier avatar
    const avatarPath = path.join(process.cwd(), currentUser.avatar.replace(/^\//, ''));
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }

    // Mettre à jour la base de données
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        company: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        bio: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'avatar_deleted',
        description: 'Photo de profil supprimée',
        userId: req.user.id
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
