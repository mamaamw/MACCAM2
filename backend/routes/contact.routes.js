import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// GET /api/contacts - Liste de tous les utilisateurs (contacts ET utilisateurs)
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        secondaryEmail: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneLabel: true,
        secondaryPhone: true,
        secondaryPhoneLabel: true,
        company: true,
        jobTitle: true,
        website: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        birthDate: true,
        labels: true,
        bio: true,
        avatar: true,
        role: true,
        isActive: true,
        isContact: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contacts/:id - Détails d'un contact
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        secondaryEmail: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneLabel: true,
        secondaryPhone: true,
        secondaryPhoneLabel: true,
        company: true,
        jobTitle: true,
        website: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        birthDate: true,
        labels: true,
        bio: true,
        avatar: true,
        isActive: true,
        isContact: true,
        createdAt: true
      }
    });
    
    if (!contact || !contact.isContact) {
      return res.status(404).json({ success: false, message: 'Contact non trouvé' });
    }
    
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contacts - Créer un nouveau contact
router.post('/', async (req, res) => {
  try {
    const { 
      email, secondaryEmail, username, firstName, lastName, 
      phone, phoneLabel, secondaryPhone, secondaryPhoneLabel,
      company, jobTitle, website, address, city, country, postalCode, 
      birthDate, labels, bio 
    } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Vérifier si le username existe déjà
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce nom d\'utilisateur est déjà pris' 
      });
    }
    
    // Créer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    const contact = await prisma.user.create({
      data: {
        email,
        secondaryEmail,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        phoneLabel,
        secondaryPhone,
        secondaryPhoneLabel,
        company,
        jobTitle,
        website,
        address,
        city,
        country,
        postalCode,
        birthDate: birthDate ? new Date(birthDate) : null,
        labels,
        bio,
        isContact: true,
        isActive: false, // Les contacts sont inactifs par défaut
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        isContact: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/contacts/:id - Modifier un contact
router.put('/:id', async (req, res) => {
  try {
    const { 
      firstName, lastName, phone, phoneLabel, secondaryPhone, secondaryPhoneLabel,
      email, secondaryEmail, username, company, jobTitle, website, 
      address, city, country, postalCode, birthDate, labels, bio 
    } = req.body;
    
    // Vérifier que c'est bien un contact
    const existingContact = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingContact || !existingContact.isContact) {
      return res.status(404).json({ success: false, message: 'Contact non trouvé' });
    }
    
    // Vérifier l'unicité de l'email si modifié
    if (email && email !== existingContact.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
    }
    
    // Vérifier l'unicité du username si modifié
    if (username && username !== existingContact.username) {
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ce nom d\'utilisateur est déjà pris' 
        });
      }
    }
    
    const contact = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        phone,
        phoneLabel,
        secondaryPhone,
        secondaryPhoneLabel,
        email,
        secondaryEmail,
        username,
        company,
        jobTitle,
        website,
        address,
        city,
        country,
        postalCode,
        birthDate: birthDate ? new Date(birthDate) : null,
        labels,
        bio
      },
      select: {
        id: true,
        email: true,
        secondaryEmail: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneLabel: true,
        secondaryPhone: true,
        secondaryPhoneLabel: true,
        company: true,
        jobTitle: true,
        website: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        birthDate: true,
        labels: true,
        bio: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/contacts/:id/activate - Activer un contact (le transformer en utilisateur)
router.put('/:id/activate', async (req, res) => {
  try {
    const { password, role } = req.body;
    
    // Vérifier que c'est bien un contact
    const contact = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!contact || !contact.isContact) {
      return res.status(404).json({ success: false, message: 'Contact non trouvé' });
    }
    
    if (contact.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce contact est déjà activé' 
      });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        password: hashedPassword,
        role: role || 'USER',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isContact: true
      }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'contact_activated',
        description: `Contact ${contact.firstName} ${contact.lastName} activé en tant qu'utilisateur`,
        userId: req.user.id
      }
    });
    
    res.json({ success: true, data: user, message: 'Contact activé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/contacts/:id/deactivate - Désactiver un utilisateur
router.put('/:id/deactivate', async (req, res) => {
  try {
    const contact = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    
    if (!contact.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet utilisateur est déjà inactif' 
      });
    }
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: false
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isContact: true
      }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        type: 'contact_deactivated',
        description: `Utilisateur ${contact.firstName} ${contact.lastName} désactivé`,
        userId: req.user.id
      }
    });
    
    res.json({ success: true, data: user, message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contacts/:id - Supprimer un contact
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier que c'est bien un contact
    const contact = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    
    if (!contact || !contact.isContact) {
      return res.status(404).json({ success: false, message: 'Contact non trouvé' });
    }
    
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, message: 'Contact supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
