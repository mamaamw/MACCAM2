import express from 'express'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
const prisma = new PrismaClient()

// Protéger toutes les routes (authentification requise)
router.use(protect)

// GET /api/v1/qr-codes - Liste tous les QR codes de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const qrCodes = await prisma.qrCode.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    })
    res.json({ success: true, qrCodes })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message })
  }
})

// GET /api/v1/qr-codes/:id - Récupère un QR code spécifique
router.get('/:id', async (req, res) => {
  try {
    const qrCode = await prisma.qrCode.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    })
    
    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'QR code non trouvé' })
    }
    
    res.json({ success: true, qrCode })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: error.message })
  }
})

// POST /api/v1/qr-codes - Crée un nouveau QR code
router.post('/', async (req, res) => {
  try {
    const { name, type, settings, thumbnail } = req.body
    
    if (!name || !type || !settings) {
      return res.status(400).json({ success: false, message: 'Nom, type et paramètres requis' })
    }
    
    const qrCode = await prisma.qrCode.create({
      data: {
        userId: req.user.id,
        name,
        type,
        settings: typeof settings === 'string' ? settings : JSON.stringify(settings),
        thumbnail
      }
    })
    
    res.status(201).json({ success: true, qrCode })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création', error: error.message })
  }
})

// PUT /api/v1/qr-codes/:id - Met à jour un QR code
router.put('/:id', async (req, res) => {
  try {
    const { name, type, settings, thumbnail } = req.body
    
    // Vérifier que le QR code appartient à l'utilisateur
    const existing = await prisma.qrCode.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    })
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'QR code non trouvé' })
    }
    
    const qrCode = await prisma.qrCode.update({
      where: { id: req.params.id },
      data: {
        name: name || existing.name,
        type: type || existing.type,
        settings: settings ? (typeof settings === 'string' ? settings : JSON.stringify(settings)) : existing.settings,
        thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail
      }
    })
    
    res.json({ success: true, qrCode })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message })
  }
})

// DELETE /api/v1/qr-codes/:id - Supprime un QR code
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier que le QR code appartient à l'utilisateur
    const existing = await prisma.qrCode.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    })
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'QR code non trouvé' })
    }
    
    await prisma.qrCode.delete({
      where: { id: req.params.id }
    })
    
    res.json({ success: true, message: 'QR code supprimé' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message })
  }
})

export default router
