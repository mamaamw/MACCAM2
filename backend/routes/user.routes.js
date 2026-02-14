import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// GET /api/users - Liste des utilisateurs (Admin/Manager)
router.get('/', authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
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
    const { firstName, lastName, email, phone, company, address, city, country, postalCode, bio } = req.body;
    
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
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        email,
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

export default router;
