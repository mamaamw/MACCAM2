import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';
import { uploadExpensePhotos } from '../config/multer.config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// Créer une nouvelle dépense
router.post('/', uploadExpensePhotos.array('photos', 5), async (req, res) => {
  try {
    const { groupId, paidById, description, amount, date, category, splitMode, participants: participantsStr } = req.body;
    const participants = participantsStr ? JSON.parse(participantsStr) : [];

    if (!groupId || !paidById || !description || !amount || !participants || participants.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données manquantes' 
      });
    }

    // Valider que la somme des parts = montant total
    const totalShares = participants.reduce((sum, p) => sum + parseFloat(p.share), 0);
    const amountValue = parseFloat(amount);
    if (Math.abs(totalShares - amountValue) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `La somme des parts (${totalShares.toFixed(2)}) doit être égale au montant total (${amountValue.toFixed(2)})` 
      });
    }

    // Vérifier l'accès au groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id: groupId,
        OR: [
          { userId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }

    // Vérifier que paidBy est membre du groupe
    const paidByMember = await prisma.expenseGroupMember.findFirst({
      where: {
        id: paidById,
        groupId
      }
    });

    if (!paidByMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le payeur n\'est pas membre de ce groupe' 
      });
    }

    // Gérer les photos uploadées
    const photosPaths = req.files ? req.files.map(file => `/uploads/expenses/${file.filename}`) : [];

    const expense = await prisma.expense.create({
      data: {
        groupId,
        paidById,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        category: category || null,
        photos: photosPaths.length > 0 ? JSON.stringify(photosPaths) : null,
        splitMode: splitMode || 'manual',
        participants: {
          create: participants.map(p => ({
            memberId: p.memberId,
            share: parseFloat(p.share)
          }))
        }
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            member: true
          }
        }
      }
    });

    // Parser les photos pour le réponse
    const expenseData = {
      ...expense,
      photos: expense.photos ? JSON.parse(expense.photos) : []
    };

    res.status(201).json({ 
      success: true, 
      data: expenseData,
      message: 'Dépense créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier une dépense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, date, category, splitMode, participants } = req.body;

    // Récupérer la dépense et vérifier l'accès
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!expense || (expense.group.userId !== req.user.id && expense.group.members.length === 0)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dépense non trouvée ou accès refusé' 
      });
    }

    // Mettre à jour la dépense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        description: description || undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        date: date ? new Date(date) : undefined,
        category: category !== undefined ? category : undefined,
        splitMode: splitMode !== undefined ? splitMode : undefined
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            member: true
          }
        }
      }
    });

    // Si les participants ont changé, les mettre à jour
    if (participants && Array.isArray(participants)) {
      // Valider que la somme des parts = montant total
      const totalShares = participants.reduce((sum, p) => sum + parseFloat(p.share), 0);
      const amountValue = amount !== undefined ? parseFloat(amount) : updatedExpense.amount;
      if (Math.abs(totalShares - amountValue) > 0.01) {
        return res.status(400).json({ 
          success: false, 
          message: `La somme des parts (${totalShares.toFixed(2)}) doit être égale au montant total (${amountValue.toFixed(2)})` 
        });
      }

      // Supprimer les anciens participants
      await prisma.expenseParticipant.deleteMany({
        where: { expenseId: id }
      });

      // Créer les nouveaux participants
      await prisma.expenseParticipant.createMany({
        data: participants.map(p => ({
          expenseId: id,
          memberId: p.memberId,
          share: parseFloat(p.share)
        }))
      });

      // Recharger la dépense avec les nouveaux participants
      const finalExpense = await prisma.expense.findUnique({
        where: { id },
        include: {
          paidBy: true,
          participants: {
            include: {
              member: true
            }
          }
        }
      });

      return res.json({ 
        success: true, 
        data: finalExpense,
        message: 'Dépense modifiée avec succès'
      });
    }

    res.json({ 
      success: true, 
      data: updatedExpense,
      message: 'Dépense modifiée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer une dépense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la dépense et vérifier l'accès
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!expense || (expense.group.userId !== req.user.id && expense.group.members.length === 0)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dépense non trouvée ou accès refusé' 
      });
    }

    // Supprimer les fichiers photos associés
    if (expense.photos) {
      try {
        const photos = JSON.parse(expense.photos);
        for (const photoPath of photos) {
          const fullPath = path.join(__dirname, '..', photoPath.replace(/^\//, ''));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la suppression des photos:', err);
      }
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Dépense supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter des photos à une dépense
router.post('/:id/photos', uploadExpensePhotos.array('photos', 5), async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier l'accès à la dépense
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!expense || (expense.group.userId !== req.user.id && expense.group.members.length === 0)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dépense non trouvée ou accès refusé' 
      });
    }

    // Récupérer les photos existantes
    const existingPhotos = expense.photos ? JSON.parse(expense.photos) : [];
    
    // Ajouter les nouvelles photos
    const newPhotos = req.files ? req.files.map(file => `/uploads/expenses/${file.filename}`) : [];
    const allPhotos = [...existingPhotos, ...newPhotos];

    // Mettre à jour la dépense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        photos: JSON.stringify(allPhotos)
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            member: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      data: {
        ...updatedExpense,
        photos: JSON.parse(updatedExpense.photos)
      },
      message: 'Photos ajoutées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des photos:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer une photo d'une dépense
router.delete('/:id/photos/:photoIndex', async (req, res) => {
  try {
    const { id, photoIndex } = req.params;

    // Vérifier l'accès à la dépense
    const expense = await prisma.expense.findFirst({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              where: { userId: req.user.id }
            }
          }
        }
      }
    });

    if (!expense || (expense.group.userId !== req.user.id && expense.group.members.length === 0)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dépense non trouvée ou accès refusé' 
      });
    }

    if (!expense.photos) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucune photo trouvée' 
      });
    }

    // Récupérer les photos existantes
    const photos = JSON.parse(expense.photos);
    const index = parseInt(photoIndex);

    if (index < 0 || index >= photos.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Photo non trouvée' 
      });
    }

    // Supprimer le fichier physique
    const photoPath = photos[index];
    const fullPath = path.join(__dirname, '..', photoPath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Retirer la photo du tableau
    photos.splice(index, 1);

    // Mettre à jour la dépense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        photos: photos.length > 0 ? JSON.stringify(photos) : null
      },
      include: {
        paidBy: true,
        participants: {
          include: {
            member: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      data: {
        ...updatedExpense,
        photos: updatedExpense.photos ? JSON.parse(updatedExpense.photos) : []
      },
      message: 'Photo supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
