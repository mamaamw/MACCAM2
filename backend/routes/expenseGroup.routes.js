import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// Obtenir tous les groupes de l'utilisateur
router.get('/', async (req, res) => {
  try {
    // Groupes créés par l'utilisateur
    const createdGroups = await prisma.expenseGroup.findMany({
      where: { userId: req.user.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                member: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Groupes où l'utilisateur est membre
    const memberGroups = await prisma.expenseGroup.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                member: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fusionner et dédupliquer
    const allGroups = [...createdGroups];
    memberGroups.forEach(group => {
      if (!allGroups.find(g => g.id === group.id)) {
        allGroups.push(group);
      }
    });

    res.json({ success: true, data: allGroups });
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Obtenir un groupe spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
        OR: [
          { userId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                member: true
              }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }

    // Parser les photos des dépenses
    const groupWithParsedPhotos = {
      ...group,
      expenses: group.expenses.map(expense => ({
        ...expense,
        photos: expense.photos ? JSON.parse(expense.photos) : [],
        shares: expense.shares ? JSON.parse(expense.shares) : null
      }))
    };

    res.json({ success: true, data: groupWithParsedPhotos });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Créer un nouveau groupe
router.post('/', async (req, res) => {
  try {
    const { name, description, currency, members } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom du groupe est requis' 
      });
    }

    const group = await prisma.expenseGroup.create({
      data: {
        userId: req.user.id,
        name,
        description: description || null,
        currency: currency || 'EUR',
        members: {
          create: [
            // Ajouter le créateur comme premier membre
            {
              userId: req.user.id,
              name: `${req.user.firstName} ${req.user.lastName}`,
              email: req.user.email
            },
            // Ajouter les autres membres
            ...(members || []).map(member => ({
              userId: member.userId || null,
              name: member.name,
              email: member.email || null
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      data: group,
      message: 'Groupe créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier un groupe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, currency } = req.body;

    // Vérifier que l'utilisateur est le créateur du groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé ou accès refusé' 
      });
    }

    const updatedGroup = await prisma.expenseGroup.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        currency: currency || undefined
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        expenses: {
          include: {
            paidBy: true,
            participants: {
              include: {
                member: true
              }
            }
          }
        }
      }
    });

    res.json({ 
      success: true, 
      data: updatedGroup,
      message: 'Groupe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer un groupe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur est le créateur du groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé ou accès refusé' 
      });
    }

    await prisma.expenseGroup.delete({
      where: { id }
    });

    res.json({ 
      success: true, 
      message: 'Groupe supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter un membre au groupe
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, userId } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom du membre est requis' 
      });
    }

    // Vérifier l'accès au groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
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

    const member = await prisma.expenseGroupMember.create({
      data: {
        groupId: id,
        userId: userId || null,
        name,
        email: email || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({ 
      success: true, 
      data: member,
      message: 'Membre ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer un membre du groupe
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // Vérifier l'accès au groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé ou accès refusé' 
      });
    }

    // Vérifier que le membre existe et n'a pas de dépenses associées
    const member = await prisma.expenseGroupMember.findFirst({
      where: {
        id: memberId,
        groupId: id
      },
      include: {
        paidExpenses: true,
        participations: true
      }
    });

    if (!member) {
      return res.status(404).json({ 
        success: false, 
        message: 'Membre non trouvé' 
      });
    }

    if (member.paidExpenses.length > 0 || member.participations.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer ce membre car il a des dépenses associées' 
      });
    }

    await prisma.expenseGroupMember.delete({
      where: { id: memberId }
    });

    res.json({ 
      success: true, 
      message: 'Membre supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Calculer les soldes du groupe
router.get('/:id/balances', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier l'accès au groupe
    const group = await prisma.expenseGroup.findFirst({
      where: {
        id,
        OR: [
          { userId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        members: true,
        expenses: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Groupe non trouvé' 
      });
    }

    // Calculer les soldes de chaque membre
    const balances = {};
    group.members.forEach(member => {
      balances[member.id] = {
        memberId: member.id,
        memberName: member.name,
        paid: 0,
        owes: 0,
        balance: 0
      };
    });

    // Calculer ce que chaque membre a payé et doit
    group.expenses.forEach(expense => {
      // Ajouter au montant payé
      balances[expense.paidById].paid += expense.amount;

      // Distribuer les parts
      expense.participants.forEach(participant => {
        balances[participant.memberId].owes += participant.share;
      });
    });

    // Calculer le solde final (payé - doit)
    Object.keys(balances).forEach(memberId => {
      balances[memberId].balance = balances[memberId].paid - balances[memberId].owes;
    });

    // Calculer les remboursements optimisés
    const settlements = calculateSettlements(balances);

    res.json({ 
      success: true, 
      data: {
        balances: Object.values(balances),
        settlements
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul des soldes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonction pour calculer les remboursements optimisés
function calculateSettlements(balances) {
  const debtors = [];
  const creditors = [];

  Object.values(balances).forEach(balance => {
    if (balance.balance < -0.01) {
      debtors.push({ ...balance, amount: Math.abs(balance.balance) });
    } else if (balance.balance > 0.01) {
      creditors.push({ ...balance, amount: balance.balance });
    }
  });

  const settlements = [];

  // Algorithme glouton pour minimiser les transactions
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.memberId,
      fromName: debtor.memberName,
      to: creditor.memberId,
      toName: creditor.memberName,
      amount: parseFloat(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }

  return settlements;
}

export default router;
