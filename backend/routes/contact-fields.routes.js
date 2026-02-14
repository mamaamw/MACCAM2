import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// ===================== EMAILS =====================

// GET /api/v1/contact-fields/:userId/emails - Tous les emails d'un contact
router.get('/:userId/emails', async (req, res) => {
  try {
    const emails = await prisma.contactEmail.findMany({
      where: { userId: req.params.userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/emails - Ajouter un email
router.post('/:userId/emails', async (req, res) => {
  try {
    const { email, label, isPrimary } = req.body;
    
    // Si c'est l'email principal, retirer le flag des autres
    if (isPrimary) {
      await prisma.contactEmail.updateMany({
        where: { userId: req.params.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const newEmail = await prisma.contactEmail.create({
      data: {
        userId: req.params.userId,
        email,
        label: label || 'Travail',
        isPrimary: isPrimary || false
      }
    });
    
    res.status(201).json({ success: true, data: newEmail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/emails/:id - Modifier un email
router.put('/emails/:id', async (req, res) => {
  try {
    const { email, label, isPrimary } = req.body;
    
    const existingEmail = await prisma.contactEmail.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingEmail) {
      return res.status(404).json({ success: false, message: 'Email non trouvé' });
    }
    
    // Si on le met en principal, retirer le flag des autres
    if (isPrimary) {
      await prisma.contactEmail.updateMany({
        where: { userId: existingEmail.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const updated = await prisma.contactEmail.update({
      where: { id: req.params.id },
      data: { email, label, isPrimary }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/emails/:id - Supprimer un email
router.delete('/emails/:id', async (req, res) => {
  try {
    await prisma.contactEmail.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Email supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== PHONES =====================

// GET /api/v1/contact-fields/:userId/phones - Tous les téléphones
router.get('/:userId/phones', async (req, res) => {
  try {
    const phones = await prisma.contactPhone.findMany({
      where: { userId: req.params.userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
    res.json({ success: true, data: phones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/phones - Ajouter un téléphone
router.post('/:userId/phones', async (req, res) => {
  try {
    const { phone, label, isPrimary } = req.body;
    
    if (isPrimary) {
      await prisma.contactPhone.updateMany({
        where: { userId: req.params.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const newPhone = await prisma.contactPhone.create({
      data: {
        userId: req.params.userId,
        phone,
        label: label || 'Mobile',
        isPrimary: isPrimary || false
      }
    });
    
    res.status(201).json({ success: true, data: newPhone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/phones/:id - Modifier un téléphone
router.put('/phones/:id', async (req, res) => {
  try {
    const { phone, label, isPrimary } = req.body;
    
    const existing = await prisma.contactPhone.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Téléphone non trouvé' });
    }
    
    if (isPrimary) {
      await prisma.contactPhone.updateMany({
        where: { userId: existing.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const updated = await prisma.contactPhone.update({
      where: { id: req.params.id },
      data: { phone, label, isPrimary }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/phones/:id
router.delete('/phones/:id', async (req, res) => {
  try {
    await prisma.contactPhone.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Téléphone supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== ADDRESSES =====================

// GET /api/v1/contact-fields/:userId/addresses
router.get('/:userId/addresses', async (req, res) => {
  try {
    const addresses = await prisma.contactAddress.findMany({
      where: { userId: req.params.userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/addresses
router.post('/:userId/addresses', async (req, res) => {
  try {
    const { label, street, city, state, postalCode, country, isPrimary } = req.body;
    
    if (isPrimary) {
      await prisma.contactAddress.updateMany({
        where: { userId: req.params.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const newAddress = await prisma.contactAddress.create({
      data: {
        userId: req.params.userId,
        label: label || 'Domicile',
        street,
        city,
        state,
        postalCode,
        country,
        isPrimary: isPrimary || false
      }
    });
    
    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/addresses/:id
router.put('/addresses/:id', async (req, res) => {
  try {
    const { label, street, city, state, postalCode, country, isPrimary } = req.body;
    
    const existing = await prisma.contactAddress.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Adresse non trouvée' });
    }
    
    if (isPrimary) {
      await prisma.contactAddress.updateMany({
        where: { userId: existing.userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }
    
    const updated = await prisma.contactAddress.update({
      where: { id: req.params.id },
      data: { label, street, city, state, postalCode, country, isPrimary }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/addresses/:id
router.delete('/addresses/:id', async (req, res) => {
  try {
    await prisma.contactAddress.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Adresse supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== WEBSITES =====================

// GET /api/v1/contact-fields/:userId/websites
router.get('/:userId/websites', async (req, res) => {
  try {
    const websites = await prisma.contactWebsite.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: websites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/websites
router.post('/:userId/websites', async (req, res) => {
  try {
    const { url, label } = req.body;
    
    const newWebsite = await prisma.contactWebsite.create({
      data: {
        userId: req.params.userId,
        url,
        label: label || 'Site Web'
      }
    });
    
    res.status(201).json({ success: true, data: newWebsite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/websites/:id
router.put('/websites/:id', async (req, res) => {
  try {
    const { url, label } = req.body;
    
    const updated = await prisma.contactWebsite.update({
      where: { id: req.params.id },
      data: { url, label }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/websites/:id
router.delete('/websites/:id', async (req, res) => {
  try {
    await prisma.contactWebsite.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Site web supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== DATES =====================

// GET /api/v1/contact-fields/:userId/dates
router.get('/:userId/dates', async (req, res) => {
  try {
    const dates = await prisma.contactDate.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: dates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/dates
router.post('/:userId/dates', async (req, res) => {
  try {
    const { date, label } = req.body;
    
    const newDate = await prisma.contactDate.create({
      data: {
        userId: req.params.userId,
        date: new Date(date),
        label: label || 'Anniversaire'
      }
    });
    
    res.status(201).json({ success: true, data: newDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/dates/:id
router.put('/dates/:id', async (req, res) => {
  try {
    const { date, label } = req.body;
    
    const updated = await prisma.contactDate.update({
      where: { id: req.params.id },
      data: { 
        date: date ? new Date(date) : undefined, 
        label 
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/dates/:id
router.delete('/dates/:id', async (req, res) => {
  try {
    await prisma.contactDate.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Date supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== RELATIONS =====================

// GET /api/v1/contact-fields/:userId/relations
router.get('/:userId/relations', async (req, res) => {
  try {
    const relations = await prisma.contactRelation.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: relations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/relations
router.post('/:userId/relations', async (req, res) => {
  try {
    const { name, label } = req.body;
    
    const newRelation = await prisma.contactRelation.create({
      data: {
        userId: req.params.userId,
        name,
        label: label || 'Contact'
      }
    });
    
    res.status(201).json({ success: true, data: newRelation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/relations/:id
router.put('/relations/:id', async (req, res) => {
  try {
    const { name, label } = req.body;
    
    const updated = await prisma.contactRelation.update({
      where: { id: req.params.id },
      data: { name, label }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/relations/:id
router.delete('/relations/:id', async (req, res) => {
  try {
    await prisma.contactRelation.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Relation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================== CUSTOM FIELDS =====================

// GET /api/v1/contact-fields/:userId/custom
router.get('/:userId/custom', async (req, res) => {
  try {
    const customFields = await prisma.contactCustomField.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: customFields });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/contact-fields/:userId/custom
router.post('/:userId/custom', async (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    const newField = await prisma.contactCustomField.create({
      data: {
        userId: req.params.userId,
        fieldName,
        value
      }
    });
    
    res.status(201).json({ success: true, data: newField });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/contact-fields/custom/:id
router.put('/custom/:id', async (req, res) => {
  try {
    const { fieldName, value } = req.body;
    
    const updated = await prisma.contactCustomField.update({
      where: { id: req.params.id },
      data: { fieldName, value }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/contact-fields/custom/:id
router.delete('/custom/:id', async (req, res) => {
  try {
    await prisma.contactCustomField.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Champ personnalisé supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
